class Log {

    constructor(container) {
        this.container = container;
    }

    log(str) {
        this._write(str, "log-info");
    }

    info(str) {
        this._write("[info] " + str, "log-info");
    }

    error(str) {
        this._write("[error] " + str, "log-error");
    };

    _write(str, className) {
        let textElement = document.createElement('h4');
        textElement.setAttribute("class", className);
        textElement.textContent = str;
        this.container.appendChild(textElement);
        this.container.scrollIntoView(false);
    }
}

// TODO: new by another object(s)
var sideex_log = new Log(document.getElementById("logcontainer"));
var help_log = new Log(document.getElementById("refercontainer"));

document.getElementById("clear-log").addEventListener("click", function() {
    var container = document.getElementById("logcontainer");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}, false);
