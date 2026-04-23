const mockNodes = {
    11: { id: 11, name: "Kandy", lat: 7.2955, lng: 80.6356 },
    8:  { id: 8, name: "Akbar Bridge", lat: 7.2546, lng: 80.5951 },
    12: { id: 12, name: "Ella", lat: 6.8756, lng: 81.0463 },
    13: { id: 13, name: "Galle", lat: 6.0367, lng: 80.2170 }
};

const mockNeighbors = {
    11: [8, 12],   // Kandy → Akbar Bridge, Ella
    8:  [11, 12],  // Akbar Bridge → Kandy, Ella
    12: [11, 13],  // Ella → Kandy, Galle
    13: [12]       // Galle → Ella
};

function getNeighborsMock(id) {
    return (mockNeighbors[id] || []).map(nid => ({
        id: nid,
        distance: 1, // ignore real distance for now
        duration: 1
    }));
}

function findByIDMock(id) {
    return mockNodes[id] || null;
}

function filterTowardTargetMock(currentID, targetID, neighbors) {
    return neighbors; // disable heuristic for now
}

function chooseNeighborByStyle(style, neighbors, path) {

    const valid = neighbors.filter(n => !path.includes(n.id));

    if (!valid.length) return null;

    if (style === "shortest") return valid[0];
    if (style === "average") return valid[Math.floor(valid.length / 2)];
    if (style === "longest") return valid[valid.length - 1];
}

async function testFullWalk() {

    let current = 11;
    const target = 13;

    const path = [11];

    for (let i = 0; i < 5; i++) {

        const neighbors = getNeighborsMock(current);

        const chosen = chooseNeighborByStyle(
            "shortest",
            neighbors,
            path
        );

        if (!chosen) break;

        path.push(chosen.id);

        current = chosen.id;

        if (current === target) break;
    }

    console.log("FINAL PATH:");
    console.log(path);
}

testFullWalk();