import {Particle} from "$lib/particles/particle.js";

describe("Particle", () => {
    test("should initialize with default values", () => {
        const p = new Particle();
        expect(p.lifeSpan).toBe(10);
        expect(p.visibleTrailCapacity).toBe(10);
        expect(p.maxInvisibleSteps).toBe(10);
    });

    test("should allow custom constructor arguments", () => {
        const p = new Particle(20, 5, 3); // lifeSpan, maxInvisibleSteps, visibleTrailCapacity
        expect(p.lifeSpan).toBe(20);
        expect(p.maxInvisibleSteps).toBe(5);
        expect(p.visibleTrailCapacity).toBe(3);
    });

    test("a constructed particle is not alive, has no location, and is invisible", () => {
        const p = new Particle();
        expect(p.isAlive).toBe(false);
        expect(p.realX).toBeNull();
        expect(p.realY).toBeNull();
        expect(p.visibleX).toBeNull();
        expect(p.visibleY).toBeNull();
        expect(p.lastVisibleX).toBeNull();
        expect(p.lastVisibleY).toBeNull();
        expect(p.visible).toBe(false);
    });

    test("kill() sets particles back to initial state", () => {
        const p = new Particle(5, 2, 2);
        p.updateLocation(true, 1, 1, 1);
        p.updateLocation(true, 2, 2, 2);
        p.kill();
        expect(p.visible).toBe(false);
        expect(p.age).toBe(0);
        expect(p.invisibleSteps).toBe(0);
        expect(p.realX).toBeNull();
        expect(p.realY).toBeNull();
        expect(p.visibleX).toBeNull();
        expect(p.visibleY).toBeNull();
        expect(p.lastVisibleX).toBeNull();
        expect(p.lastVisibleY).toBeNull();
        expect(p.getVisibleTrail()).toEqual([]);
    });

    // --- Age ---
    test("when age exceeds lifeSpan the particles dies", () => {
        const p = new Particle(3, 0, 0);
        p.updateLocation(false, 1, 2, 1);
        p.updateLocation(false, 2, 4, 1);
        p.updateLocation(false, 3, 4, 5);
        expect(p.isAlive).toEqual(false);
    });

    test("relativeAge returns correct ratio or 0 if lifeSpan is 0", () => {
        const p = new Particle(10, 0, 0);
        expect(p.relativeAge).toBe(0);
        p.updateLocation(true, 1, 1, 5);
        expect(p.relativeAge).toBe(0.5);
        p.updateLocation(true, 2, 2, 5);
        expect(p.relativeAge).toBe(1);
        p.updateLocation(true, 3, 3, 5);
        expect(p.relativeAge).toBe(0); // reset after exceeding lifespan
        const p2 = new Particle(0, 0, 0);
        expect(p2.relativeAge).toBe(0);
    });

    // --- Invisible steps ---
    test("invisibleSteps increments only when invisible", () => {
        const p = new Particle(10, 2);
        expect(p.invisibleSteps).toBe(0);
        p.updateLocation(false, 1, 2, 1);
        expect(p.invisibleSteps).toBe(1);
        p.updateLocation(false, 3, 4, 1);
        expect(p.invisibleSteps).toBe(2);
    });

    test("when invisibleSteps exceeds maxInvisibleSteps the particles dies", () => {
        const p = new Particle(10, 2);
        expect(p.invisibleSteps).toBe(0);
        p.updateLocation(false, 1, 2, 1);
        expect(p.invisibleSteps).toBe(1);
        p.updateLocation(false, 3, 4, 1);
        expect(p.invisibleSteps).toBe(2);
    });

    test("resetting maxInvisibleSteps to a value below current invisibleSteps kills the particle", () => {
        const p = new Particle(10, 0, 10);
        p.updateLocation(true, 1, 1, 1);
        p.updateLocation(false, 2, 2, 2);
        p.updateLocation(false, 3, 3, 3);
        p.updateLocation(false, 4, 4, 4);
        p.setMaxInvisibleSteps(1);
        expect(p.isAlive).toEqual(false);
    });

    // -- Visible trail ---
    test("visible trail buffer works as FIFO, respects capacity, and does not add invisible steps", () => {
        const p = new Particle(10, 1, 2);
        p.updateLocation(true, 1, 1, 1);
        expect(p.getVisibleTrail()).toEqual([{x: 1, y: 1}]);
        p.updateLocation(true, 2, 2, 1);
        expect(p.getVisibleTrail()).toEqual([
            {x: 1, y: 1},
            {x: 2, y: 2},
        ]);
        p.updateLocation(true, 3, 3, 1);
        expect(p.getVisibleTrail()).toEqual([
            {x: 2, y: 2},
            {x: 3, y: 3},
        ]);
        p.updateLocation(false, 4, 4, 1); // Must not add to trail
        expect(p.getVisibleTrail()).toEqual([
            {x: 2, y: 2},
            {x: 3, y: 3},
        ]);
    });

    it("visible trail remains correct after pushing out locations multiple times", () => {
        const p = new Particle(10, 0, 2);
        for (let i = 0; i < 6; i++) {
            p.updateLocation(true, i, i + 1, 1);
        }
        expect(p.getVisibleTrail()).toEqual([
            {x: 4, y: 5},
            {x: 5, y: 6},
        ]);
    });

    test("getVisibleTrail() returns empty if capacity is 0", () => {
        const p = new Particle(10, 0, 0);
        p.updateLocation(true, 1, 1, 1);
        expect(p.getVisibleTrail()).toEqual([]);
    });
});
