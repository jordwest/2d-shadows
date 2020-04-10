declare var window: Window & {
  debugState?: Map<string, string>;
};

export namespace Debug {
  export function record(label: string, value: any) {
    if (window.debugState == null) {
      window.debugState = new Map();
    }
    window.debugState.set(label, JSON.stringify(value, null, 2));
  }

  export function output(element: Element) {
    if (window.debugState == null) {
      window.debugState = new Map();
    }

    let lines: string[] = [];
    window.debugState.forEach((val, key) => {
      lines.push(`${key}: ${val}`);
    });
    element.innerHTML = "<pre>" + lines.join("\n") + "</pre>";
  }

  export function time(label: string, action: () => void) {
    const start = performance.now();
    action();
    const end = performance.now();

    record(label, `${end - start}ms`);
  }
}
