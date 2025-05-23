export type ModifierFunc = (args: string) => string;

/**
 * Modifiers are a way to transform text in a custom way.
 * They can be used in templates to modify the output of a handler.
 */
export const modifiers: Record<string, ModifierFunc> = {
    upper: (text: string) => text.toUpperCase(),
    lower: (text: string) => text.toLowerCase(),
    capitalize: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
    reverse: (text: string) => text.split("").reverse().join(""),
    blank: (_) => "",
    replace: (args: string) => {
        const split = args.split(",");
        if (split.length < 3) {
            throw new Error("Invalid number of arguments for replace modifier");
        }
        const from = split[split.length - 2];
        const to = split[split.length - 1];
        const text = split.slice(0, -2).join(",");
        return text.split(from).join(to);
    },
};
