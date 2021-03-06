import { BuildConfig, BuildContext, ComponentRegistry, HydrateOptions, HydrateResults } from '../../util/interfaces';
import { hydrateHtml } from '../hydrate-html';
import { mockBuildConfig, compareHtml } from '../../testing/mocks';
import { h } from '../../core/renderer/h';
import { SLOT_META } from '../../util/constants';


describe('hydrate', () => {

  it('should load content in nested named slots', () => {
    const ctx: BuildContext = {};
    const hydrateResults: HydrateResults = {
      diagnostics: []
    };
    const registry: ComponentRegistry = {
      'ion-test': {
        componentModule: class {
          render() {
            return h('elm-a', null,
              h('slot', { name: 'slot-a' }),
              h('slot', null),
              h('slot', { name: 'slot-b' })
            );
          }
        },
        slotMeta: SLOT_META.HasNamedSlots
      }
    };
    const opts: HydrateOptions = {
      html: `
        <ion-test>
          <div>default slot text</div>
          <div slot="slot-b">inner slot-b text</div>
          <div slot="slot-a">inner slot-a text</div>
        </ion-test>
      `
    };

    return hydrateHtml(config, ctx, registry, opts).then(hydrateResults => {
      expect(hydrateResults.diagnostics.length).toBe(0);

      expect(compareHtml(hydrateResults.html)).toEqual(compareHtml(`
        <html dir="ltr" data-ssr="">
          <head></head>
          <body>
            <ion-test data-ssrv="0" class="${config.hydratedCssClass}">
              <elm-a data-ssrc="0.0.">
                <div slot="slot-a">inner slot-a text</div>
                <div>default slot text</div>
                <div slot="slot-b">inner slot-b text</div>
              </elm-a>
            </ion-test>
          </body>
        </html>
      `));
    });
  });

  it('should load content in nested default slot', () => {
    const ctx: BuildContext = {};
    const hydrateResults: HydrateResults = {
      diagnostics: []
    };
    const registry: ComponentRegistry = {
      'ion-test': {
        componentModule: class {
          render() {
            return h('elm-a', null,
              'inner text',
              h('slot', null)
            );
          }
        },
        slotMeta: SLOT_META.HasSlots
      }
    };
    const opts: HydrateOptions = {
      html: `
        <ion-test>
          content text
        </ion-test>
      `
    };

    return hydrateHtml(config, ctx, registry, opts).then(hydrateResults => {
      expect(hydrateResults.diagnostics.length).toBe(0);

      expect(compareHtml(hydrateResults.html)).toEqual(compareHtml(`
        <html dir="ltr" data-ssr="">
          <head></head>
          <body>
            <ion-test data-ssrv="0" class="${config.hydratedCssClass}">
              <elm-a data-ssrc="0.0">
                <!--s.0.0-->inner text<!--/-->
                content text
              </elm-a>
            </ion-test>
          </body>
        </html>
      `));
    });
  });

  it('should load one component and assign ssr ids', () => {
    const ctx: BuildContext = {};
    const hydrateResults: HydrateResults = {
      diagnostics: []
    };
    const registry: ComponentRegistry = {
      'ion-test': {
        componentModule: class {
          render() {
            return h('div', null);
          }
        }
      }
    };
    const opts: HydrateOptions = {
      html: `<ion-test></ion-test>`
    };

    return hydrateHtml(config, ctx, registry, opts).then(hydrateResults => {
      expect(hydrateResults.diagnostics.length).toBe(0);

      expect(compareHtml(hydrateResults.html)).toEqual(compareHtml(`
        <html dir="ltr" data-ssr="">
          <head></head>
          <body>
            <ion-test data-ssrv="0" class="${config.hydratedCssClass}">
              <div data-ssrc="0.0."></div>
            </ion-test>
          </body>
        </html>
      `));
    });
  });

  it('should do nothing when no components registered', () => {
    const ctx: BuildContext = {};
    const hydrateResults: HydrateResults = {
      diagnostics: []
    };
    const registry: ComponentRegistry = {};
    const opts: HydrateOptions = {
      html: `<body>hello</body>`
    };

    return hydrateHtml(config, ctx, registry, opts).then(hydrateResults => {
      expect(hydrateResults.diagnostics.length).toBe(1);
      expect(hydrateResults.html).toBe(`<body>hello</body>`);
    });
  });

  var config: BuildConfig = {};

  beforeEach(() => {
    config = mockBuildConfig();
  });

});


