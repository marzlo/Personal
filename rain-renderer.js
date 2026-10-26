/* Rainy Window adaptation: CC BY-NC-SA 3.0.
 * rocksdanister / Martijn Steinrucken (BigWings).
 * Sources and changes: assets/ambience/rain/NOTICE.txt */
export async function createRainRenderer(host,image){
 const canvas=document.createElement('canvas');canvas.className='ambience-canvas';canvas.setAttribute('aria-hidden','true');
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false});
 if(!gl){host.dataset.rain='fallback';return null}
 let program,texture,buffer,vertex,fragment,observer,frame=0,running=false,disposed=false,time=18,last=0,ready=false;
 function cleanup(){cancelAnimationFrame(frame);observer?.disconnect();if(texture)gl.deleteTexture(texture);if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);canvas.remove();disposed=true}
 try{
  const response=await fetch(new URL('./assets/ambience/rain/rain.frag',import.meta.url));if(!response.ok)throw Error('Rain shader unavailable');
  function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('Rain shader could not compile')}return shader}
  vertex=compile(gl.VERTEX_SHADER,'attribute vec2 position; varying vec2 vUv; void main(){vUv=position*.5+.5;gl_Position=vec4(position,0.,1.);}');
  fragment=compile(gl.FRAGMENT_SHADER,await response.text());program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Rain shader could not link');gl.useProgram(program);
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
  for(const axis of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,axis,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  const uniform=name=>gl.getUniformLocation(program,name);
  gl.uniform1i(uniform('u_tex0'),0);gl.uniform2f(uniform('u_tex0_resolution'),image.naturalWidth,image.naturalHeight);
  for(const [name,value] of Object.entries({u_speed:.55,u_intensity:.5,u_normal:.65,u_brightness:1.08,u_blur_intensity:0,u_zoom:1}))gl.uniform1f(uniform(name),value);
  for(const [name,value] of Object.entries({u_blur_iterations:1,u_panning:0,u_post_processing:0,u_lightning:0,u_texture_fill:1}))gl.uniform1i(uniform(name),value);
  const resolution=uniform('u_resolution'),clock=uniform('u_time');
  function draw(){if(disposed||gl.isContextLost())return;gl.uniform1f(clock,time);gl.drawArrays(gl.TRIANGLES,0,6)}
  function resize(){const box=host.getBoundingClientRect(),scale=Math.min(1,1000/Math.max(1,box.width));canvas.width=Math.max(1,Math.round(box.width*scale));canvas.height=Math.max(1,Math.round(box.height*scale));gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(resolution,canvas.width,canvas.height);draw()}
  function tick(now){if(!running||disposed)return;if(!last)last=now;if(now-last>=50){time+=Math.min((now-last)/1000,.1);last=now;draw()}frame=requestAnimationFrame(tick)}
  host.prepend(canvas);observer=new ResizeObserver(resize);observer.observe(host);resize();ready=true;
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cleanup();host.dataset.rain='fallback';host.dispatchEvent(new Event('ambience-fallback'))});
  host.dataset.rain='ready';
  return {setRunning(value){if(disposed)return;running=value;cancelAnimationFrame(frame);last=0;if(running&&ready)frame=requestAnimationFrame(tick);host.dataset.rainPlaying=String(running)},dispose:cleanup};
 }catch{cleanup();host.dataset.rain='fallback';return null}
}
