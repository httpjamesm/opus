import Dexie from "dexie";

export const db = new Dexie("opus");
db.version(1).stores({
    keys: "++id, key",
});
db.open().catch(function (e) {
    alert("Open failed: " + e);
});
