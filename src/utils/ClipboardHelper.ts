import { Notice } from "obsidian";
import { Logger } from "./Logger";

export class ClipboardHelper {
    public static async copy(text: string): Promise<void> {
        const data = new ClipboardItem({
            "text/html": new Blob([text], {
                // @ts-ignore
                type: ["text/html", "text/plain"],
            }),
            "text/plain": new Blob([text], {
                type: "text/plain",
            }),
        });
        navigator.clipboard
            .write([data])
            .then(() => {
                new Notice("Text copied to clipboard");
            })
            .catch((err) => {
                Logger.error("Could not write to clipboard: " + err);
            });
    }
}
