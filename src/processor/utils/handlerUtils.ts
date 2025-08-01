import { MDTemplate } from "src/settings/settings";
import toCustom, { CustomOptions } from "../toCustom";
import { Nodes } from "mdast";
import { FrontmatterVariables, GlobalVariables } from "../types";

/**
 * Get the template for a node depending on its options
 * @param profileTemplate
 * @param opts
 * @returns
 */
export function getTemplate(
    profileTemplate: string | MDTemplate,
    opts: CustomOptions,
): string {
    if (typeof profileTemplate === "string") {
        return profileTemplate;
    }

    switch (true) {
        case profileTemplate.templateFirstChild && opts.isFirstChild:
            return profileTemplate.templateFirstChild;
        case profileTemplate.templateLastChild && opts.isLastChild:
            return profileTemplate.templateLastChild;
        case profileTemplate.templateFirstOfType && opts.isFirstOfType:
            return profileTemplate.templateFirstOfType;
        case profileTemplate.templateLastOfType && opts.isLastOfType:
            return profileTemplate.templateLastOfType;
        default:
            return profileTemplate.template;
    }
}

export function getTemplateWithGlobalAndFrontmatterVariables(
    profileTemplate: string | MDTemplate,
    opts: CustomOptions,
): string {
    let temp = getTemplate(profileTemplate, opts);

    if (opts.globalVars) {
        temp = replaceGlobalVariables(temp, opts.globalVars);
    }

    if (opts.frontmatterVars) {
        temp = replaceFrontmatterVariables(temp, opts.frontmatterVars);
    }

    return temp;
}

export function replaceGlobalVariables(
    text: string,
    globalVars: GlobalVariables,
): string {
    for (const [key, value] of Object.entries(globalVars)) {
        // replace $globalVar with value
        text = text.replaceAll(`\$${key}`, value);
    }
    return text;
}

export function replaceFrontmatterVariables(
    text: string,
    frontmatterVars: FrontmatterVariables,
): string {
    for (const [key, value] of Object.entries(frontmatterVars)) {
        // replace $$frontmatterVar with value
        text = text.replaceAll(`\$fm-${key}`, value);
    }

    // remove frontmatter variables that did not match, e.g. $fm-permalink
    text = text.replaceAll(/\$fm-\w+/gm, "");

    return text;
}

/**
 * Convert all children list to string
 * @param children
 * @param opts
 * @returns converted children
 */
export function convertChildren(
    children: Nodes[],
    opts: CustomOptions,
): string[] {
    if (children.length === 0) {
        return [];
    }

    const totalTypeCount = countNodeTypes(children);

    // Keep track of the number of children of each type
    // as we iterate through them
    const typeCount: Record<string, number> = {};

    const output: string[] = [];

    // Iterate through all children
    for (const [idx, child] of children.entries()) {
        typeCount[child.type] = (typeCount[child.type] || 0) + 1;

        const isFirstChild = idx === 0;
        const isLastChild = idx === children.length - 1;
        const isFirstOfType = typeCount[child.type] === 1;
        const isLastOfType =
            typeCount[child.type] === totalTypeCount[child.type];

        const childOpts: CustomOptions = {
            ...opts,
            isFirstOfType,
            isLastOfType,
            isFirstChild,
            isLastChild,
        };

        output.push(toCustom(child, childOpts));
    }

    return output;
}

/**
 * Count the number of nodes of each type in a list
 * @param nodes list of nodes
 * @returns object with node type as key and count as value
 */
export function countNodeTypes(nodes: Nodes[]): Record<string, number> {
    return nodes.reduce(
        (acc, curr) => {
            acc[curr.type] = (acc[curr.type] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );
}
