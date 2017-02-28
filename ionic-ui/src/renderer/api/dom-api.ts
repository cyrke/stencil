
export interface DomApi {
  createElement: (tagName: any) => HTMLElement;
  createElementNS: (namespaceURI: string, qualifiedName: string) => Element;
  createTextNode: (text: string) => Text;
  createComment: (text: string) => Comment;
  insertBefore: (parentNode: Node, newNode: Node, referenceNode: Node | null) => void;
  removeChild: (node: Node, child: Node) => void;
  appendChild: (node: Node, child: Node) => void;
  parentNode: (node: Node) => Node;
  nextSibling: (node: Node) => Node;
  tagName: (elm: Element) => string;
  setTextContent: (node: Node, text: string | null) => void;
  getTextContent: (node: Node) => string | null;
  getAttribute: (node: Node, attrName: string) => string;
  getProperty: (node: Node, propName: string) => string;
  getPropOrAttr: (node: Node, propName: string) => any;
  setStyle: (node: Node, styleName: string, styleValue: any) => void;
  isElement: (node: Node) => node is Element;
  isText: (node: Node) => node is Text;
  isComment: (node: Node) => node is Comment;
}