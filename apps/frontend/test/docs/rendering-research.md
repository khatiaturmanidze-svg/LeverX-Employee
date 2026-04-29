# Rendering Techniques in React Applications (DOM vs Canvas vs WebGL)

## 1. Introduction

Modern web applications often need to render large amounts of data such as tables, charts, or interactive views. When using traditional DOM-based rendering in React, performance issues can occur due to the overhead of managing many elements.

This research explores alternative rendering approaches such as Canvas and WebGL, and compares their performance, complexity, and use cases.

---

## 2. Problem with DOM Rendering

React uses the DOM to render UI elements. While this works well for typical interfaces, it becomes inefficient when rendering thousands of elements, because one <div> element represents one node in memory, so 10000 nodes would become a problem for massive data rendering.

### Issues:

- High memory usage
- Slow rendering with large datasets
- Lag during updates and scrolling

---

## 3. Rendering Methods

### 3.1 DOM Rendering

- Standard React rendering using HTML elements

**Pros:**

- Easy to use
- Built-in interactivity
- Accessible

**Cons:**

- Poor performance with large datasets

---

### 3.2 Canvas Rendering

Canvas allows drawing elements directly using pixels instead of DOM nodes.

**Pros:**

- Better performance for large data
- Lower memory usage

**Cons:**

- No built-in interactivity
- Requires manual event handling

---

### 3.3 WebGL Rendering

WebGL uses GPU acceleration to render complex visuals.

**Pros:**

- Extremely high performance
- Handles large-scale rendering efficiently

**Cons:**

- Complex implementation
- Overkill for simple UI

---

## 4. Experiment

# DOM vs Canvas Rendering Experiment

## Goal

The goal of this experiment is to compare how the browser behaves when rendering a large amount of visual data with regular DOM elements versus rendering the same amount of data into a single `<canvas>`.

The test page is available through the `rendering-test` route and has two modes:

- `DOM`: renders the grid using real HTML elements.
- `Canvas`: renders the grid by drawing onto one canvas element.

## Experiment Setup

Both modes use the same data size:

- Columns: `250`
- Rows: `200`
- Total cells: `50,000`
- Cell size: `20px x 16px`

This keeps the data volume equal between the two tests. The important difference is how that data is represented in the browser.

## DOM Mode

`DomTest` creates `50,000` real `<div>` elements.

Each cell has:

- A border
- Text content
- Inline styles
- Dynamic background color
- Dynamic text color

The DOM version also updates every `80ms` while running. Each update changes the `tick` state, which causes React to re-render the grid and recalculate the visual state for all cells.

A `Stop DOM updates` button was added so the update loop can be paused. This helps show that the performance problem is not only the number of elements, but also the repeated reconciliation, style recalculation, layout, and paint work caused by updating so many DOM nodes.

## Canvas Mode

`CanvasTest` uses the same `50,000` cells, but it does not create `50,000` DOM nodes.

Instead, it creates one `<canvas>` element and draws the full grid with the Canvas 2D API:

- White cell background
- Cell border
- Text label

The canvas version draws the grid once during mount. After drawing, the browser only manages a single DOM element.

## Results

The DOM version is noticeably heavier because the browser must manage every cell as an individual element. With `50,000` nodes and repeated updates, the page can become slower to render, slower to respond, and more expensive to repaint.

The canvas version handles the same amount of visual data more comfortably because the browser does not need to track each cell as a separate DOM node. The data is still drawn, but the DOM tree remains small.

## Conclusion

For large, mostly visual datasets, canvas is a better fit than rendering every item as a DOM element.

DOM is useful when individual elements need semantic structure, accessibility, focus behavior, native events, or normal document flow. However, when the UI needs to display tens of thousands of tiny visual cells, DOM rendering becomes expensive quickly.

Canvas avoids that cost by turning the grid into pixels inside one element. The tradeoff is that canvas does not provide individual DOM nodes, so interactions, accessibility, selection, and hit testing must be implemented manually if needed.

### Results:

(To be filled after implementation)

---
