/**@
* #2D
* @category 2D
* Component to display the following types of bounding boxes of entities: 
* normal entity, minimum bounding box and rotated entity.
* * @example
* ~~~
* var foo = Crafty.e("2D, DOM, SpriteAnimation, BoxOverlays");
* foo.boxOverlays.fontSize = 12;
* ~~~
* This will display all three box types and their coordinates with the font
* size 12px.
*/
Crafty.c("BoxOverlays", {
    /* Parts of this component are inspired by Witali Mik's (BlackScorp)
     * HitBox component: https://github.com/BlackScorp/crafty_hitbox */

    init: function(){
        if (Crafty.support.canvas){
            // Public API
            this.boxOverlays = {};
            
            // bo is for internal use
            var bo = this.boxOverlays;
            bo.drawMBR     = true;
            bo.drawRot     = true;
            bo.fontSize    = 9;
            bo.boxColor    = "#5AF";
            bo.mbrBoxColor = "#FF0";
            bo.rotBoxColor = "#0F0";
            bo.markTopLeft = true;
            
            function formatCoords(x, y, w, h) {
                var formatString = "x:%d, y:%d";
                
                if (typeof(w) != "undefined" && typeof(h) != "undefined") {
                    formatString += ", w:%d, h:%d";
                }
                
                return _.string.sprintf(formatString, x, y, w, h);
            }
            
            // get or create canvas element
            var c = document.getElementById('BoxOverlaysCanvas');
            
            if (!c) {
                c = document.createElement("canvas");
                c.id = 'BoxOverlaysCanvas';
                c.width = Crafty.viewport.width;
                c.height = Crafty.viewport.height;
                c.style.position = 'absolute';
                c.style.left = "0px";
                c.style.top = "0px";
                c.style.zIndex = Crafty.stage.elem.style.zIndex + 1;
                Crafty.stage.elem.appendChild(c); 
            }
            
            var ctx = c.getContext('2d');
            
            this.bind("EnterFrame", function(){
                ctx.clearRect(0, 0, Crafty.viewport.width, Crafty.viewport.height);
                
                ctx.font = "bold " + bo.fontSize + "px monospace";
                
                // box with default entity coordinates
                ctx.strokeStyle = bo.boxColor;
                ctx.fillStyle = bo.boxColor;
                ctx.strokeRect(this._x, this._y, this._w, this._h);
                
                if (bo.markTopLeft) ctx.fillRect(this._x-2, this._y-2, 5, 5);
                
                var mbr = this.mbr();

                ctx.fillText("Ent: " + formatCoords(this._x, this._y, this._w, this._h), mbr._x + mbr._w + 5, mbr._y + bo.fontSize);
                
                // box with rotation applied
                if (bo.drawRot) {
                    var deg = this.rotation * (Math.PI / 180);
                    var cosDeg = Math.cos(deg);
                    var sinDeg = Math.sin(deg);
                    var x = this.x + this._origin.x + cosDeg * (-this._origin.x) - sinDeg * (-this._origin.y);
                    var y = this.y + this._origin.y + sinDeg * (-this._origin.x) + cosDeg * (-this._origin.y);
                    
                    ctx.fillStyle = bo.rotBoxColor;
                    ctx.strokeStyle = bo.rotBoxColor;
                    ctx.fillText("Rot: " + formatCoords(x, y), mbr._x + mbr._w + 5, mbr._y + bo.fontSize * 2 + 3);
                    
                    if (bo.markTopLeft) ctx.fillRect(x-2, y-2, 5, 5);
                    
                    /* draw only if it doesn't overlap with entity box,
                       i.e. if the entity is rotated */
                    if (typeof(this.rotation) != "undefined" && (this.rotation % 360 != 0)) {
                        ctx.save();
                        ctx.strokeStyle = bo.rotBoxColor;
                        ctx.translate(this.x + this._origin.x, this.y + this._origin.y);
                        ctx.rotate(deg);
                        ctx.strokeRect(-this._origin.x, -this._origin.y, this.w, this.h);
                        ctx.restore();
                    }
                }
                
                // minimum bounding rectangle of the (rotated) entity
                if (bo.drawMBR) {
                    ctx.fillStyle = bo.mbrBoxColor;
                    ctx.strokeStyle = bo.mbrBoxColor;
                    ctx.fillText("MBR: " + formatCoords(mbr._x, mbr._y, mbr._w, mbr._h), mbr._x + mbr._w + 5, mbr._y + bo.fontSize * 3 + 6);
                    
                    if (bo.markTopLeft) ctx.fillRect(mbr._x-2, mbr._y-2, 5, 5);
                    
                    /* draw only if it doesn't overlap with entity box,
                       i.e. if the entity is rotated */
                    if (mbr._x != this._x || mbr._y != this._y || mbr._w != this._w || mbr._h != this._h) {
                        ctx.strokeRect(mbr._x, mbr._y, mbr._w, mbr._h);
                    }
                }

            }); 
        }
        
        return this;
    }
});
