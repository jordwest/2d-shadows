declare var window: Window & {
  debugState?: Map<string, string>;
};

export namespace Debug {
  export function record(key: string, value: any) {
    if (window.debugState == null) {
      window.debugState = new Map();
    }
    window.debugState.set(key, JSON.stringify(value));
  }

  export function output(element: Element) {
    if (window.debugState == null) {
      window.debugState = new Map();
    }

    let lines = [];
    window.debugState.forEach((val, key) => {
      lines.push(`${key}: ${val}`);
    });
    element.innerHTML = "<pre>" + lines.join("\n") + "</pre>";
  }
}
