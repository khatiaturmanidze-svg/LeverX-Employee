import { useEffect, useRef, useState } from 'react';

const cols = 250;
const rows = 200;
const instances = cols * rows;

export default function WebGpuTest() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [message, setMessage] = useState('Initializing WebGPU...');

  useEffect(() => {
    let isMounted = true;
    let animationId = 0;

    async function render() {
      const canvas = canvasRef.current;

      if (!canvas) return;

      if (!navigator.gpu) {
        setMessage('WebGPU is not supported in this browser.');
        return;
      }

      const adapter = await navigator.gpu.requestAdapter();

      if (!adapter) {
        setMessage('WebGPU adapter is not available.');
        return;
      }

      const device = await adapter.requestDevice();
      const context = canvas.getContext('webgpu');

      if (!context) {
        setMessage('Could not create a WebGPU canvas context.');
        return;
      }

      const format = navigator.gpu.getPreferredCanvasFormat();
      const ratio = window.devicePixelRatio || 1;

      canvas.width = 1000 * ratio;
      canvas.height = 800 * ratio;
      canvas.style.width = '1000px';
      canvas.style.height = '800px';

      context.configure({
        device,
        format,
        alphaMode: 'opaque',
      });

      const shader = device.createShaderModule({
        code: `
          struct Uniforms {
            tick: f32,
          };

          @group(0) @binding(0)
          var<uniform> uniforms: Uniforms;

          struct VertexOutput {
            @builtin(position) position: vec4f,
            @location(0) color: vec4f,
          };

          @vertex
          fn vertexMain(
            @builtin(vertex_index) vertexIndex: u32,
            @builtin(instance_index) instanceIndex: u32,
          ) -> VertexOutput {
            let columns = ${cols}u;
            let rows = ${rows}u;
            let col = instanceIndex % columns;
            let row = instanceIndex / columns;
            let cellWidth = 2.0 / f32(columns);
            let cellHeight = 2.0 / f32(rows);
            let gap = 0.0015;

            var corner = vec2f(0.0, 0.0);

            switch vertexIndex {
              case 0u: { corner = vec2f(0.0, 0.0); }
              case 1u: { corner = vec2f(1.0, 0.0); }
              case 2u: { corner = vec2f(0.0, 1.0); }
              case 3u: { corner = vec2f(0.0, 1.0); }
              case 4u: { corner = vec2f(1.0, 0.0); }
              default: { corner = vec2f(1.0, 1.0); }
            }

            let x = -1.0 + f32(col) * cellWidth + corner.x * (cellWidth - gap);
            let y = 1.0 - f32(row) * cellHeight - corner.y * (cellHeight - gap);
            let wave = sin(f32(instanceIndex) * 0.03 + uniforms.tick) * 0.5 + 0.5;

            var output: VertexOutput;
            output.position = vec4f(x, y, 0.0, 1.0);
            output.color = mix(
              vec4f(0.54, 0.93, 0.82, 1.0),
              vec4f(1.0, 0.68, 0.74, 1.0),
              wave,
            );

            return output;
          }

          @fragment
          fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
            return input.color;
          }
        `,
      });

      const uniformBuffer = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: shader,
          entryPoint: 'vertexMain',
        },
        fragment: {
          module: shader,
          entryPoint: 'fragmentMain',
          targets: [{ format }],
        },
        primitive: {
          topology: 'triangle-list',
        },
      });

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: uniformBuffer,
            },
          },
        ],
      });

      const uniforms = new Float32Array(4);
      const drawFrame = (time: number) => {
        uniforms[0] = time * 0.004;
        device.queue.writeBuffer(uniformBuffer, 0, uniforms);

        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0.97, g: 0.98, b: 1, a: 1 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(6, instances);
        pass.end();

        device.queue.submit([encoder.finish()]);
        animationId = window.requestAnimationFrame(drawFrame);
      };

      animationId = window.requestAnimationFrame(drawFrame);

      if (isMounted) {
        setMessage(
          `WebGPU is animating ${instances.toLocaleString()} cells on the GPU.`,
        );
      }
    }

    render();

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div>
      <p className="rendering-test__empty">{message}</p>
      <canvas ref={canvasRef} />
    </div>
  );
}
