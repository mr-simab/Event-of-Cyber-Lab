(function () {
  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function typeLine(target, text, speed, className) {
    var lineTarget = target;
    if (className) {
      lineTarget = document.createElement("span");
      lineTarget.className = className;
      target.appendChild(lineTarget);
    }

    for (var i = 0; i < text.length; i += 1) {
      lineTarget.textContent += text.charAt(i);
      await sleep(speed);
    }

    target.appendChild(document.createTextNode("\n"));
  }

  async function runTerminalScript(options) {
    var log = document.getElementById(options.logId || "log");
    if (!log) return;

    var cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.textContent = "_";
    log.after(cursor);

    var lines = options.lines || [];
    var lineDelay = typeof options.lineDelay === "number" ? options.lineDelay : 120;
    var speed = typeof options.speed === "number" ? options.speed : 28;

    for (var l = 0; l < lines.length; l += 1) {
      var current = lines[l];
      if (typeof current === "string") {
        await typeLine(log, current, speed);
      } else {
        await typeLine(log, current.text || "", current.speed || speed, current.className || "");
      }
      await sleep(lineDelay);
    }

    cursor.remove();

    if (typeof options.onComplete === "function") {
      options.onComplete();
    }
  }

  window.TerminalFX = {
    run: runTerminalScript,
  };
})();
