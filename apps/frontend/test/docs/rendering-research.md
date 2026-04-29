# Rendering Techniques in React Applications (DOM vs Canvas vs WebGL vs WebGPU)

## 1. Introduction

Modern web applications often need to render large amounts of data such as tables, charts, or interactive views. When using traditional DOM-based rendering in React, performance issues can occur due to the overhead of managing many elements.

This research explores alternative rendering approaches such as Canvas, WebGL, and WebGPU, and compares their performance, complexity, and use cases.

---

## 2. Problem with DOM Rendering

React uses the DOM to render UI elements. While this works well for typical interfaces, it becomes inefficient when rendering thousands of elements.

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

### 3.4 WebGPU Rendering

WebGPU is a newer browser API for using the GPU. It gives lower-level access than Canvas 2D and is designed as a modern replacement for many WebGL use cases.

**Pros:**

- Very high performance potential
- Designed for modern GPU workloads
- Better suited for complex rendering and computation than Canvas 2D

**Cons:**

- More complex than Canvas 2D
- Browser support is newer and not universal
- Requires more setup code even for a basic example

---

## 4. Experiment

# DOM vs Canvas Rendering Experiment

## Goal

The goal of this experiment is to compare how the browser behaves when rendering a large amount of visual data with regular DOM elements versus rendering the same amount of data into a single `<canvas>`.

The test page is available through the `rendering-test` route and has three modes:

- `DOM`: renders the grid using real HTML elements.
- `Canvas`: renders the grid by drawing onto one canvas element.
- `WebGPU`: renders a basic GPU-backed canvas.

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

## WebGPU Mode

`WebGpuTest` renders the same amount of visual data as the DOM and Canvas examples: `50,000` cells.

It uses the WebGPU API to:

- Check if `navigator.gpu` exists
- Request a GPU adapter
- Request a GPU device
- Create a WebGPU canvas context
- Configure the canvas
- Create a GPU shader
- Create a render pipeline
- Draw `50,000` rectangles using instancing
- Animate the colors every frame using `requestAnimationFrame`

The important difference is that WebGPU does not create `50,000` DOM nodes and does not manually draw every cell from JavaScript on every frame. Instead, it sends one instanced draw call to the GPU. The vertex shader calculates each cell position from the instance index, and the fragment shader colors the result.

This demonstrates both sides of WebGPU: it can handle a large animated visual workload efficiently, but it requires much more setup than Canvas 2D.

## Results

The DOM version is noticeably heavier because the browser must manage every cell as an individual element. With `50,000` nodes and repeated updates, the page can become slower to render, slower to respond.

The canvas version handles the same amount of visual data more comfortably because the browser does not need to track each cell as a separate DOM node. The data is still drawn, but the DOM tree remains small.

The WebGPU version renders and animates the same `50,000` cell count using GPU instancing. It is much closer to the kind of workload where GPU-based rendering becomes useful: many repeated visual objects, frequent updates, and minimal DOM involvement.

## Decision: choosing the right rendering method

There is no single best rendering method across all scenarios. Instead, the choice depends on the requirements of the application including data size, interactivity and visuals, and perfomance.
to determine the most fitting rendering approach, there has to be considered:

1. Data size and scale

- DOM rendering performs well for small to medium datasets but struggles significantly when handling thousands of elements due to increased memory and layout recalculation costs.
- Canvas rendering handles large datasets more efficiently by avoiding DOM nodes and drawing pixels directly.
- WebGL rendering is designed for extremely large-scale data, using GPU acceleration for massive rendering.
- WebGPU has similar goals to WebGL but exposes a more modern GPU API. It can be excellent for very complex visualizations, but it has the highest setup cost.

2. Interactivity requirements

- DOM supports interactivity such as events, focus, accessibility.
- Canvas requires manual implementation of interactions such as hover states, and click handling.
- WebGl also requires custom interactivity logic with high level libraries.
- WebGPU also requires custom interactivity logic and is usually best used through libraries unless the team needs low-level GPU control.

3. Visual complecity

- DOM is suitable for structured UI elements such as forms, layouts, dashboards.
- Canvas is ideal for 2D visualizations such as grids, charts, heatmaps, and spreadsheet-like interfaces.
- WebGL is best suited for 3D graphics, simulations, and highly complex or data-dense visual environments.
- WebGPU is best suited for advanced graphics, GPU computation, video editing timelines/previews, complex data visualization, and future high-performance rendering tools.

## Current Code Examples

- `DomTest`: renders `50,000` real DOM cells and updates them every `80ms`.
- `CanvasTest`: draws the same `50,000` cell grid into one `<canvas>`.
- `WebGpuTest`: animates `50,000` GPU-rendered cells using WebGPU instancing.

## Final Recommendation

For this project research task, Canvas is the most practical option for an Excel-like view with a large amount of user data. It is significantly simpler than WebGL or WebGPU while still avoiding the main DOM performance problem.

WebGL and WebGPU are more appropriate when the view becomes graphically complex, needs GPU acceleration, or requires rendering workloads that Canvas 2D cannot handle comfortably.
