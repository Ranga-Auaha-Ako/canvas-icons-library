// returns a window with a document and an svg root node
// const { createSVGWindow } = require('svgdom')
import {createSVGWindow} from 'svgdom';
// const { SVG, registerWindow } = require('@svgdotjs/svg.js')
import {SVG, registerWindow} from '@svgdotjs/svg.js';
const serverWindow = createSVGWindow()
const serverDocument = serverWindow.document

// register window and document
registerWindow(serverWindow, serverDocument)

// Constants for colours
const validBlacks = new Set([
    "black",
    "#000000",
    "#000",
    "rgb(0,0,0)",
    "rgb(0,0,0,1)"
    ]);
const validColours = new Set(["", null, "none", "transparent", ...validBlacks]);

export const parseIcon = (icon: string, canvas=SVG(serverDocument.documentElement)): {issues: Array<string>, canvas: any} => {
    const iconCanvas = canvas.svg(icon);
    const issues = [];
    // Detect wrong size
    if (canvas.width() > 0 || canvas.height() > 0) issues.push("Size");
    // Detect wrong colours
    const allElems = canvas.node.getElementsByTagName("*");
    let wrongColour = false;
    for (let e of allElems) {
    const stroke = e.getAttribute("stroke");
    const fill = e.getAttribute("fill");
    if (!validColours.has(stroke) || !validColours.has(fill)) wrongColour = true;
        console.log(stroke, fill);
    }

    if (wrongColour || !validBlacks.has(canvas.stroke()._stroke))
    issues.push("Colour");
    return { issues, canvas };
}

export const fixIcon = (icon: string, givenIssues=false as false|[], canvas=SVG(serverDocument.documentElement)): string => {
    let issues, resultCanvas;
    if(!givenIssues) {
        const result = parseIcon(icon, canvas)
        issues = result.issues;
        resultCanvas = result.canvas;
    } else {
        resultCanvas = canvas;
        issues = givenIssues;
    }
    for (let issue of issues) {
        switch (issue) {
            case "Size":
                resultCanvas.size(48, 48);
                break;
            case "Colour":
                const allElems = canvas.node.getElementsByTagName("*");
                for (let e of allElems) {
                    const stroke = e.getAttribute("stroke");
                    const fill = e.getAttribute("fill");
                    if (!validColours.has(stroke)) e.setAttribute("stroke", "black");
                    if (!validColours.has(fill)) e.setAttribute("fill", "black");
                }
                break;
        }
    }
    return resultCanvas.svg();
}