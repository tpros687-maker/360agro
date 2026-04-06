import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    category: {
        type: String,
        default: "general"
    },
    label: String,
    type: {
        type: String,
        enum: ["text", "textarea", "number", "boolean", "color"],
        default: "text"
    }
}, { timestamps: true });

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;
