import { BuildConfig, BuildContext, HostConfig, HostRule, HostRuleHeader, HydrateComponent, ManifestBundle, PrerenderResult, ServiceWorkerConfig } from '../../util/interfaces';
import { DEFAULT_STYLE_MODE } from '../../util/constants';
import { getBundleFileName, getAppWWWBuildDir } from '../app/app-file-naming';
import { pathJoin, readFile } from '../util';


export async function generateHostConfig(config: BuildConfig, ctx: BuildContext, prerenderResults: PrerenderResult[]) {
  const hostConfig: HostConfig = {
    hosting: {
      rules: []
    }
  };

  prerenderResults = prerenderResults.sort((a, b) => {
    if (a.url.toLowerCase() < b.url.toLowerCase()) return -1;
    if (a.url.toLowerCase() > b.url.toLowerCase()) return 1;
    return 0;
  });

  prerenderResults.forEach(prerenderResult => {
    const hostRule = generateHostRule(config, ctx, prerenderResult);
    if (hostRule) {
      hostConfig.hosting.rules.push(hostRule);
    }
  });

  addDefaults(config, hostConfig);

  const hostConfigFilePath = pathJoin(config, config.wwwDir, HOST_CONFIG_FILENAME);

  await mergeUserHostConfigFile(config, hostConfig);

  ctx.filesToWrite[hostConfigFilePath] = JSON.stringify(hostConfig, null, 2);
}


export function generateHostRule(config: BuildConfig, ctx: BuildContext, prerenderResult: PrerenderResult) {
  const hostRule: HostRule = {
    include: prerenderResult.path,
    headers: generateHostRuleHeaders(config, ctx, prerenderResult)
  };

  if (hostRule.headers.length === 0) {
    return null;
  }

  return hostRule;
}


export function generateHostRuleHeaders(config: BuildConfig, ctx: BuildContext, prerenderResult: PrerenderResult) {
  const hostRuleHeaders: HostRuleHeader[] = [];

  addStyles(config, hostRuleHeaders, prerenderResult);
  addCoreJs(config, ctx.appCoreWWWPath, hostRuleHeaders);
  addBundles(config, ctx.manifestBundles, hostRuleHeaders, prerenderResult.components);
  addScripts(config, hostRuleHeaders, prerenderResult);
  addImgs(config, hostRuleHeaders, prerenderResult);

  return hostRuleHeaders;
}


function addCoreJs(config: BuildConfig, appCoreWWWPath: string, hostRuleHeaders: HostRuleHeader[]) {
  const relPath = pathJoin(config, '/', config.sys.path.relative(config.wwwDir, appCoreWWWPath));

  hostRuleHeaders.push(formatLinkRelPreloadHeader(relPath));
}


export function addBundles(config: BuildConfig, manifestBundles: ManifestBundle[], hostRuleHeaders: HostRuleHeader[], components: HydrateComponent[]) {
  components = sortComponents(components);

  const bundleIds = getBundleIds(manifestBundles, components);

  bundleIds.forEach(bundleId => {
    if (hostRuleHeaders.length < MAX_LINK_REL_PRELOAD_COUNT) {
      const bundleUrl = getBundleUrl(config, bundleId);

      hostRuleHeaders.push(formatLinkRelPreloadHeader(bundleUrl));
    }
  });
}


export function getBundleIds(manifestBundles: ManifestBundle[], components: HydrateComponent[]) {
  const bundleIds: string[] = [];

  components.forEach(cmp => {
    manifestBundles.forEach(mb => {
      const moduleFile = mb.moduleFiles.find(mf => mf.cmpMeta && mf.cmpMeta.tagNameMeta === cmp.tag);
      if (!moduleFile) {
        return;
      }

      let bundleId = moduleFile.cmpMeta.bundleIds[DEFAULT_MODE];
      if (!bundleId) {
        bundleId = moduleFile.cmpMeta.bundleIds[DEFAULT_STYLE_MODE];
      }

      if (!bundleId || !bundleId.es2015 || bundleIds.indexOf(bundleId.es2015) > -1) {
        return;
      }

      bundleIds.push(bundleId.es2015);
    });
  });

  return bundleIds;
}


function getBundleUrl(config: BuildConfig, bundleId: string) {
  const unscopedFileName = getBundleFileName(bundleId, false);
  const unscopedWwwBuildPath = pathJoin(config, getAppWWWBuildDir(config), unscopedFileName);
  return pathJoin(config, '/', config.sys.path.relative(config.wwwDir, unscopedWwwBuildPath));
}


export function sortComponents(components: HydrateComponent[]) {
  return components.sort((a, b) => {
    if (a.depth > b.depth) return -1;
    if (a.depth < b.depth) return 1;
    if (a.count > b.count) return -1;
    if (a.count < b.count) return 1;
    if (a.tag < b.tag) return -1;
    if (a.tag > b.tag) return 1;
    return 0;
  });
}


function addStyles(config: BuildConfig, hostRuleHeaders: HostRuleHeader[], prerenderResult: PrerenderResult) {
  prerenderResult.styleUrls.forEach(styleUrl => {
    if (hostRuleHeaders.length >= MAX_LINK_REL_PRELOAD_COUNT) {
      return;
    }

    const url = config.sys.url.parse(styleUrl);
    if (url.hostname === prerenderResult.hostname) {
      hostRuleHeaders.push(formatLinkRelPreloadHeader(url.path));
    }
  });
}


function addScripts(config: BuildConfig, hostRuleHeaders: HostRuleHeader[], prerenderResult: PrerenderResult) {
  prerenderResult.scriptUrls.forEach(scriptUrl => {
    if (hostRuleHeaders.length >= MAX_LINK_REL_PRELOAD_COUNT) {
      return;
    }

    const url = config.sys.url.parse(scriptUrl);
    if (url.hostname === prerenderResult.hostname) {
      hostRuleHeaders.push(formatLinkRelPreloadHeader(url.path));
    }
  });
}


function addImgs(config: BuildConfig, hostRuleHeaders: HostRuleHeader[], prerenderResult: PrerenderResult) {
  prerenderResult.imgUrls.forEach(imgUrl => {
    if (hostRuleHeaders.length >= MAX_LINK_REL_PRELOAD_COUNT) {
      return;
    }

    const url = config.sys.url.parse(imgUrl);
    if (url.hostname === prerenderResult.hostname) {
      hostRuleHeaders.push(formatLinkRelPreloadHeader(url.path));
    }
  });
}


export function formatLinkRelPreloadHeader(url: string) {
  const header: HostRuleHeader = {
    name: 'Link',
    value: formatLinkRelPreloadValue(url)
  };
  return header;
}


function formatLinkRelPreloadValue(url: string) {
  const parts = [
    `<${url}>`,
    `rel=preload`
  ];

  const ext = url.split('.').pop().toLowerCase();
  if (ext === SCRIPT_EXT) {
    parts.push(`as=script`);

  } else if (ext === STYLE_EXT) {
    parts.push(`as=style`);

  } else if (IMG_EXTS.indexOf(ext) > -1) {
    parts.push(`as=image`);
  }

  return parts.join(';');
}


function addDefaults(config: BuildConfig, hostConfig: HostConfig) {
  addBuildDirCacheControl(config, hostConfig);
  addServiceWorkerNoCacheControl(config, hostConfig);
}


function addBuildDirCacheControl(config: BuildConfig, hostConfig: HostConfig) {
  const relPath = pathJoin(config, '/', config.sys.path.relative(config.wwwDir, getAppWWWBuildDir(config)), '**');

  hostConfig.hosting.rules.push({
    include: relPath,
    headers: [
      {
        name: `Cache-Control`,
        value: `public, max-age=31536000`
      }
    ]
  });
}


function addServiceWorkerNoCacheControl(config: BuildConfig, hostConfig: HostConfig) {
  if (!config.serviceWorker) {
    return;
  }
  const swConfig = config.serviceWorker as ServiceWorkerConfig;

  const relPath = pathJoin(config, '/', config.sys.path.relative(config.wwwDir, swConfig.swDest));

  hostConfig.hosting.rules.push({
    include: relPath,
    headers: [
      {
        name: `Cache-Control`,
        value: `no-cache, no-store, must-revalidate`
      }
    ]
  });
}


async function mergeUserHostConfigFile(config: BuildConfig, hostConfig: HostConfig) {
  const hostConfigFilePath = pathJoin(config, config.srcDir, HOST_CONFIG_FILENAME);
  try {
    const userHostConfigStr = await readFile(config.sys, hostConfigFilePath);

    const userHostConfig = JSON.parse(userHostConfigStr) as HostConfig;

    mergeUserHostConfig(userHostConfig, hostConfig);

  } catch (e) {}
}


export function mergeUserHostConfig(userHostConfig: HostConfig, hostConfig: HostConfig) {
  if (!userHostConfig || !userHostConfig.hosting) {
    return;
  }

  if (!Array.isArray(userHostConfig.hosting.rules)) {
    return;
  }

  const rules = userHostConfig.hosting.rules.concat(hostConfig.hosting.rules);

  hostConfig.hosting.rules = rules;
}


const DEFAULT_MODE = 'md';
const MAX_LINK_REL_PRELOAD_COUNT = 6;
const HOST_CONFIG_FILENAME = 'host.config.json';

const IMG_EXTS = ['png', 'gif', 'svg', 'jpg', 'jpeg', 'webp'];
const STYLE_EXT = 'css';
const SCRIPT_EXT = 'js';
