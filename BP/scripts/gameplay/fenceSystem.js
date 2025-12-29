import { world, system } from "@minecraft/server";
console.warn("[keirazelle] Beta Fence System Loaded");

// beta 1.7.3: fences only connect to other fences, not walls/panes/blocks
const CONFIG = Object.freeze({
    FENCE_ID: "bh:fence",
    CHECK_INTERVAL: 2,
    DIRECTIONS: Object.freeze({
        north: { x: 0, z: -1, state: "bh:north" },
        south: { x: 0, z: 1, state: "bh:south" },
        east: { x: 1, z: 0, state: "bh:east" },
        west: { x: -1, z: 0, state: "bh:west" }
    })
});

// deduplication map using string keys
const pendingUpdates = new Map();

// when fence is placed, update it and all neighbors
world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const block = event.block;
    if (block.typeId !== CONFIG.FENCE_ID) return;
    
    // update placed fence
    scheduleUpdate(block.location, block.dimension);
    
    // also update neighbor fences so they connect to us
    for (const dir of Object.values(CONFIG.DIRECTIONS)) {
        const neighborLoc = {
            x: block.location.x + dir.x,
            y: block.location.y,
            z: block.location.z + dir.z
        };
        scheduleUpdate(neighborLoc, block.dimension);
    }
});

// when block is broken, update neighbor fences
world.afterEvents.playerBreakBlock.subscribe((event) => {
    const loc = event.block.location;
    const dim = event.block.dimension;
    
    for (const dir of Object.values(CONFIG.DIRECTIONS)) {
        const neighborLoc = { x: loc.x + dir.x, y: loc.y, z: loc.z + dir.z };
        scheduleUpdate(neighborLoc, dim);
    }
});

function scheduleUpdate(location, dimension) {
    // use string key for proper deduplication
    const key = `${dimension.id}:${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)}`;
    pendingUpdates.set(key, { location, dimension });
}

// process pending updates
system.runInterval(() => {
    if (pendingUpdates.size === 0) return;
    
    for (const [key, update] of pendingUpdates.entries()) {
        try {
            const block = update.dimension.getBlock(update.location);
            if (!block || block.typeId !== CONFIG.FENCE_ID) continue;
            
            updateFenceConnections(block);
        } catch (e) {
            // chunk not loaded or block error, skip
        }
    }
    
    pendingUpdates.clear();
}, CONFIG.CHECK_INTERVAL);

function updateFenceConnections(block) {
    const perm = block.permutation;
    let newPerm = perm;
    let changed = false;
    
    for (const [name, dir] of Object.entries(CONFIG.DIRECTIONS)) {
        const neighborLoc = {
            x: block.location.x + dir.x,
            y: block.location.y,
            z: block.location.z + dir.z
        };
        
        let shouldConnect = false;
        
        try {
            const neighbor = block.dimension.getBlock(neighborLoc);
            shouldConnect = neighbor !== null && neighbor.typeId === CONFIG.FENCE_ID;
        } catch (e) {
            shouldConnect = false;
        }
        
        const currentState = perm.getState(dir.state);
        if (currentState !== shouldConnect) {
            newPerm = newPerm.withState(dir.state, shouldConnect);
            changed = true;
        }
    }
    
    if (changed) {
        block.setPermutation(newPerm);
    }
}
