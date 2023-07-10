export function spCode() {
    return `
      let audio = input();
      let pointerDown = input();
      
      
      let size = input(1, 0, 3);
  
      let warpSpace = (p)=> {
          p = getRayDirection().x*8.0*(vec3(0.5, .2, .1) + p);
          let t = audio /4.;
          for(let i = 1.0; i < 3; i+= 1.0) { 
              p.x = p.x + size * sin(2.0 * t + i * 1.5 * p.y)+t * 0.05;
              p.y = p.x + size * cos(2.0 * t + i * 1.5 * p.x);
              }
              return  0.5 + 0.6 * cos(time+audio*2 + vec3(p.x, p.y, p.x) + vec3(0., 1., 4.));
      }
  
      size = .4;
        
      let gyroidSteps = input(0.9, 0, 0)
      
      let r = getRayDirection();
      let warpedSpace = warpSpace(r);
      metal(.9);
      shine(1.03);
      color( 1 - warpedSpace);
      sphere(0.3);
      expand(length(warpedSpace)*.4)
    `;
  }