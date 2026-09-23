// Web previews and closed-test builds must never request live AdMob inventory.
window.SPACE_TOWER_AD_CONFIG = Object.freeze({ mode: "test" });
