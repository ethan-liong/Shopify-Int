const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let imageSchema = Schema({
    title: { type: String, required: false },
    privacy: { type: Boolean, required: false },
    tags: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, required: false }
});



module.exports = mongoose.model("Images", imageSchema);