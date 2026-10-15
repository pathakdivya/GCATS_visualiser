class ControllerPreview {
  constructor() {
    this.controllerType = null;
    this.keyboardAxis = { x: 0, y: 0 };
    this.xboxButton = document.getElementById("show-xbox");
    this.playstationButton = document.getElementById("show-playstation");
    this.xboxDiagram = document.getElementById("about-diagram-xbox");
    this.playstationDiagram = document.getElementById("about-diagram-playstation");
    this.emptyState = document.getElementById("controller-empty-state");
    this.xboxButton?.addEventListener("click", () => this.setControllerType("xbox"));
    this.playstationButton?.addEventListener("click", () => this.setControllerType("playstation"));
    window.addEventListener("keydown", (e) => this.handleKey(e, true));
    window.addEventListener("keyup", (e) => this.handleKey(e, false));
    const saved = localStorage.getItem("gcats-controller-layout");
    if (saved === "xbox" || saved === "playstation") this.setControllerType(saved);
    this.renderLoop();
  }
  setControllerType(type) {
    this.clearCurrentVisualState();
    this.controllerType = type;
    localStorage.setItem("gcats-controller-layout", type);
    this.emptyState?.classList.add("is-hidden");
    this.xboxDiagram?.classList.toggle("is-hidden", type !== "xbox");
    this.playstationDiagram?.classList.toggle("is-hidden", type !== "playstation");
    this.xboxButton?.classList.toggle("selected", type === "xbox");
    this.playstationButton?.classList.toggle("selected", type === "playstation");
    this.xboxButton?.setAttribute("aria-pressed", String(type === "xbox"));
    this.playstationButton?.setAttribute("aria-pressed", String(type === "playstation"));
    this.bindCurrentControllerElements();
  }
  clearCurrentVisualState() {
    document.querySelectorAll(".active").forEach((el) => el.classList.remove("active"));
    for (const id of ["about-xbox-lt", "about-xbox-rt"]) { const el=document.getElementById(id); if(el){el.setAttribute("height","0");el.setAttribute("y","62");} }
    for (const id of ["l2", "r2"]) { const el=document.getElementById(id); if(el) el.style.opacity="0"; }
  }
  bindCurrentControllerElements() {
    if (this.controllerType === "xbox") {
      this.stickLeftDot=document.getElementById("about-xbox-ls-dot"); this.stickLeftCircle=document.getElementById("about-xbox-ls-group");
      this.stickRightDot=document.getElementById("about-xbox-rs-dot"); this.stickRightCircle=document.getElementById("about-xbox-rs-group");
      this.buttonEls={0:document.getElementById("about-xbox-a"),1:document.getElementById("about-xbox-b"),2:document.getElementById("about-xbox-x"),3:document.getElementById("about-xbox-y"),4:document.getElementById("about-xbox-lb"),5:document.getElementById("about-xbox-rb"),6:document.getElementById("about-xbox-lt"),7:document.getElementById("about-xbox-rt"),8:document.getElementById("about-xbox-back"),9:document.getElementById("about-xbox-start"),12:document.getElementById("about-xbox-dpad-up"),13:document.getElementById("about-xbox-dpad-down"),14:document.getElementById("about-xbox-dpad-left"),15:document.getElementById("about-xbox-dpad-right"),16:document.getElementById("about-xbox-center")};
    } else if (this.controllerType === "playstation") {
      this.stickLeftDot=document.getElementById("visual-stick-left"); this.stickLeftCircle=document.getElementById("visual-stick-left-circle");
      this.stickRightDot=document.getElementById("visual-stick-right"); this.stickRightCircle=document.getElementById("visual-stick-right-circle");
      this.buttonEls={0:document.getElementById("cross"),1:document.getElementById("circle"),2:document.getElementById("square"),3:document.getElementById("triangle"),4:document.getElementById("l1"),5:document.getElementById("r1"),6:document.getElementById("l2"),7:document.getElementById("r2"),8:document.getElementById("share"),9:document.getElementById("options"),12:document.getElementById("dpad-up"),13:document.getElementById("dpad-down"),14:document.getElementById("dpad-left"),15:document.getElementById("dpad-right")};
    } else { this.stickLeftDot=this.stickLeftCircle=this.stickRightDot=this.stickRightCircle=null; this.buttonEls=null; }
  }
  firstConnectedGamepad() { return Array.from(navigator.getGamepads?.() ?? []).find((pad)=>pad!==null&&pad.connected) ?? null; }
  handleKey(e,isDown) { const v=isDown?1:0; switch(e.key){case "ArrowLeft":this.keyboardAxis.x=-v;break;case "ArrowRight":this.keyboardAxis.x=v;break;case "ArrowUp":this.keyboardAxis.y=-v;break;case "ArrowDown":this.keyboardAxis.y=v;break;} }
  updateStickVisual(dot,circle,x,y,base) { if(!dot||!circle||!base)return; const maxOffset=this.controllerType==="xbox"?28:3; dot.setAttribute("cx",String(base.x+x*maxOffset)); dot.setAttribute("cy",String(base.y+y*maxOffset)); const active=Math.hypot(x,y)>0.15; dot.classList.toggle("active",active); circle.classList.toggle("active",active); }
  resetWhenDisconnected() { if(this.buttonEls)Object.values(this.buttonEls).forEach((el)=>el?.classList.remove("active")); if(this.controllerType==="xbox"){for(const id of ["about-xbox-lt","about-xbox-rt"]){const el=document.getElementById(id);if(el){el.setAttribute("height","0");el.setAttribute("y","62");}}}else if(this.controllerType==="playstation"){for(const id of ["l2","r2"]){const el=document.getElementById(id);if(el)el.style.opacity="0";}} }
  updateButtons(gp) {
    if(!this.buttonEls)return;
    Object.entries(this.buttonEls).forEach(([indexStr,el])=>{if(!el)return;const index=Number(indexStr);const button=gp.buttons[index];if(!button)return;
      if(this.controllerType==="xbox"&&(index===6||index===7)){const value=Number(button.value||0);const height=value*26;el.setAttribute("height",String(height));el.setAttribute("y",String(62-height));el.classList.toggle("active",value>0.05);return;}
      if(this.controllerType==="playstation"&&(index===6||index===7)){const value=Number(button.value||0);el.style.opacity=String(value*0.9);el.classList.toggle("active",value>0.05);return;}
      el.classList.toggle("active",!!(button.pressed||button.value>0.5));
    });
  }
  renderLoop() { const loop=()=>{const gp=this.firstConnectedGamepad();let leftX=this.keyboardAxis.x,leftY=this.keyboardAxis.y,rightX=0,rightY=0;if(gp&&this.buttonEls){leftX=gp.axes[0]||0;leftY=gp.axes[1]||0;rightX=gp.axes[2]||0;rightY=gp.axes[3]||0;this.updateButtons(gp);}else{this.resetWhenDisconnected();}if(this.controllerType==="xbox"){this.updateStickVisual(this.stickLeftDot,this.stickLeftCircle,leftX,leftY,{x:182,y:190});this.updateStickVisual(this.stickRightDot,this.stickRightCircle,rightX,rightY,{x:396,y:295});}else if(this.controllerType==="playstation"){this.updateStickVisual(this.stickLeftDot,this.stickLeftCircle,leftX,leftY,{x:35,y:50});this.updateStickVisual(this.stickRightDot,this.stickRightCircle,rightX,rightY,{x:65,y:49});}requestAnimationFrame(loop);};loop(); }
}

document.addEventListener("DOMContentLoaded",()=>new ControllerPreview());
