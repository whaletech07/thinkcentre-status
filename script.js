// i hate javascript

let INCIDENTS = [];

function setOnlineState() {
    document.getElementById("title").textContent = "Loading...";
    document.getElementById("sub").textContent = "Fetching incident data";
    document.getElementById("circle").className = "circle ok-circle";
    document.getElementById("circle").textContent = "✓";
}

function getWorstSeverity(incidents) {
    if (!Array.isArray(incidents) || incidents.length === 0) return "ok";

    const hasActive = incidents.some(i => i.status !== "resolved");
    if (!hasActive) return "ok";

    const active = incidents.filter(i => i.status !== "resolved");

    const hasCritical = active.some(i => i.severity === "critical");
    const hasDegraded = active.some(i => i.severity === "degraded");

    if (hasCritical) return "critical";
    if (hasDegraded) return "degraded";
    return "ok";
}

function setTheme(sev) {
    document.body.classList.remove("ok", "degraded", "critical");
    document.body.classList.add(sev);
}

function addIncident(container, incident) {
    const div = document.createElement("div");

    const statusClass =
    incident.status === "resolved" ? "resolved" :
    incident.severity === "critical" ? "critical" : "";

    div.className = "incident " + statusClass;

    const services = Array.isArray(incident.services)
    ? incident.services.join(", ")
    : "none";

    const badge = incident.auto ? "AUTO" : "MANUAL";

    div.innerHTML = `
    <div class="incident-title">
    ${incident.title}
    <span class="badge ${incident.auto ? "auto" : "manual"}">${badge}</span>
    </div>
    <div class="incident-sub">${incident.description || ""}</div>
    <div class="incident-sub">Services: ${services}</div>
    <div class="incident-sub">ID: ${incident.id || "unknown"}</div>
    `;

    container.appendChild(div);
}

function render() {
    const timeline = document.getElementById("timeline");

    timeline.innerHTML = "<h3 style='color:#aaa;'>Recent Incidents</h3>";

    const severity = getWorstSeverity(INCIDENTS);
    setTheme(severity);

    const circle = document.getElementById("circle");
    const title = document.getElementById("title");
    const sub = document.getElementById("sub");

    circle.className =
    "circle " +
    (severity === "ok"
    ? "ok-circle"
    : severity === "degraded"
    ? "degraded-circle"
    : "critical-circle");

    circle.textContent =
    severity === "ok" ? "✓" :
    severity === "degraded" ? "!" : "×";

    if (severity === "ok") {
        title.textContent = "All Systems Operational";
        sub.textContent = "No active incidents";
    } else if (severity === "degraded") {
        title.textContent = "Degraded Performance";
        sub.textContent = "Some services are experiencing issues";
    } else {
        title.textContent = "Major Outage";
        sub.textContent = "Critical systems affected";
    }

    let has = false;

    for (const incident of INCIDENTS) {
        addIncident(timeline, incident);
        has = true;
    }

    if (!has) {
        addIncident(timeline, {
            title: "No incidents detected",
            description: "All systems healthy",
            status: "resolved",
            severity: "ok",
            services: [],
            auto: true,
            id: "none"
        });
    }
}

async function update() {
    try {
        const res = await fetch("output/incidents.json?t=" + Date.now());
        INCIDENTS = await res.json();
        render();
    } catch (e) {
        console.error(e);
    }
}

update();
setOnlineState();
setInterval(update, 5000);
