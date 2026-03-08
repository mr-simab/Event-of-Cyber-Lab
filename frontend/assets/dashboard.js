(function () {
  var commandPool = [
    'nmap -sV 10.42.0.0/24',
    'hydra -L users.txt -P rockyou.txt ssh://target',
    'python osint_scan.py --deep --geo',
    'traceroute secure-gateway.eoc',
    'tcpdump -i eth0 port 443',
    'whois target-domain.local',
    'aircrack-ng capture.cap',
    'sqlmap -u https://node/api?id=7 --batch',
    'nikto -h https://target',
    'masscan 10.0.0.0/8 -p80,443 --rate 10000'
  ];

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function setClock() {
    var now = new Date();
    var timeText = now.toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    var dateText = now.toLocaleDateString([], {
      weekday: 'short', year: 'numeric', month: 'short', day: '2-digit'
    });

    document.querySelectorAll('.clock-time').forEach(function (el) { el.textContent = timeText; });
    document.querySelectorAll('.clock-date').forEach(function (el) { el.textContent = dateText; });
  }

  function updateMonitors() {
    var cpu = random(31, 92);
    var ram = random(38, 95);
    var net = random(20, 88);
    var up = random(6, 110);
    var down = random(10, 160);

    document.querySelectorAll('[data-value="cpu"]').forEach(function (el) { el.textContent = cpu + '%'; });
    document.querySelectorAll('[data-value="ram"]').forEach(function (el) { el.textContent = ram + '%'; });
    document.querySelectorAll('[data-value="net"]').forEach(function (el) { el.textContent = net + '%'; });

    document.querySelectorAll('[data-net="up"]').forEach(function (el) { el.textContent = up + ' Mbps'; });
    document.querySelectorAll('[data-net="down"]').forEach(function (el) { el.textContent = down + ' Mbps'; });

    document.querySelectorAll('.fake-progress[data-meter="cpu"] > span').forEach(function (bar) { bar.style.width = cpu + '%'; });
    document.querySelectorAll('.fake-progress[data-meter="ram"] > span').forEach(function (bar) { bar.style.width = ram + '%'; });
    document.querySelectorAll('.fake-progress[data-meter="net"] > span').forEach(function (bar) { bar.style.width = net + '%'; });
    document.querySelectorAll('.fake-progress[data-auto] > span').forEach(function (bar) { bar.style.width = random(20, 98) + '%'; });
  }

  function ensureSparkBars() {
    document.querySelectorAll('.sparkline').forEach(function (line) {
      if (line.children.length > 0) return;
      for (var i = 0; i < 28; i += 1) {
        line.appendChild(document.createElement('i'));
      }
    });
  }

  function updateSparklines() {
    document.querySelectorAll('.sparkline').forEach(function (line) {
      Array.prototype.forEach.call(line.children, function (bar) {
        bar.style.height = random(14, 100) + '%';
      });
    });
  }

  function updateNeuralNet() {
    document.querySelectorAll('.neural-net').forEach(function (net) {
      var nodes = net.querySelectorAll('.node');
      nodes.forEach(function (node) { node.classList.remove('active'); });

      var activeCount = random(2, Math.max(2, nodes.length - 1));
      for (var i = 0; i < activeCount; i += 1) {
        var idx = random(0, nodes.length - 1);
        nodes[idx].classList.add('active');
      }
    });
  }

  function rotateFeed() {
    document.querySelectorAll('[data-auto-feed]').forEach(function (feed) {
      var items = feed.querySelectorAll('li');
      if (items.length === 0) return;

      for (var i = items.length - 1; i > 0; i -= 1) {
        items[i].textContent = items[i - 1].textContent;
      }

      var cmd = commandPool[random(0, commandPool.length - 1)];
      items[0].textContent = '> ' + cmd;
    });
  }

  function initNeuralNetworkLayout() {
    document.querySelectorAll('.neural-net').forEach(function (net) {
      if (net.dataset.ready === '1') return;
      net.dataset.ready = '1';

      var points = [
        [12, 18], [30, 40], [18, 70], [42, 84], [58, 22], [72, 46], [64, 78], [86, 58]
      ];
      var links = [[0,1],[1,3],[2,3],[0,2],[4,5],[5,6],[4,7],[3,5],[1,4],[6,7],[2,6]];

      points.forEach(function (p) {
        var n = document.createElement('span');
        n.className = 'node';
        n.style.left = p[0] + '%';
        n.style.top = p[1] + '%';
        net.appendChild(n);
      });

      links.forEach(function (link) {
        var a = points[link[0]];
        var b = points[link[1]];
        var dx = b[0] - a[0];
        var dy = b[1] - a[1];
        var len = Math.sqrt(dx * dx + dy * dy);
        var ang = Math.atan2(dy, dx) * 180 / Math.PI;

        var line = document.createElement('span');
        line.className = 'link';
        line.style.left = a[0] + '%';
        line.style.top = a[1] + '%';
        line.style.width = len + '%';
        line.style.transform = 'rotate(' + ang + 'deg)';
        net.appendChild(line);
      });
    });
  }

  function init() {
    initNeuralNetworkLayout();
    ensureSparkBars();
    setClock();
    updateMonitors();
    updateSparklines();
    updateNeuralNet();
    rotateFeed();

    setInterval(setClock, 1000);
    setInterval(updateMonitors, 1400);
    setInterval(updateSparklines, 1300);
    setInterval(updateNeuralNet, 900);
    setInterval(rotateFeed, 2200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
