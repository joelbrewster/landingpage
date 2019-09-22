{
    const body = document.body;
    const docEl = document.documentElement;

    const lineEq = (y2, y1, x2, x1, currentVal) => {
        var m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
        return m * currentVal + b;
    };

    const lerp = (a,b,n) => (1 - n) * a + n * b;

    const distance = (x1,x2,y1,y2) => {
        var a = x1 - x2;
        var b = y1 - y2;
        return Math.hypot(a,b);
    };

    const getMousePos = (e) => {
        let posx = 0;
        let posy = 0;
        if (!e) e = window.event;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY) 	{
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        return { x : posx, y : posy }
    }

    let winsize;
    const calcWinsize = () => winsize = {width: window.innerWidth, height: window.innerHeight};
    calcWinsize();
    window.addEventListener('resize', calcWinsize);

    const feDisplacementMapEl = document.querySelector('feDisplacementMap');

    class Menu {
        constructor() {
            this.DOM = {
                svg: document.querySelector('svg.distort'),
                menu: document.querySelector('nav.menu')
            };
            // The images (one per menu link)
            this.DOM.imgs = [...this.DOM.svg.querySelectorAll('g > image')];
            // The menu links
            this.DOM.menuLinks = [...this.DOM.menu.querySelectorAll('.menu__link')];
            // Mouse position
            this.mousePos = {x: winsize.width/2, y: winsize.height/2};
            this.lastMousePos = {
                translation: {x: winsize.width/2, y: winsize.height/2},
                displacement: {x: 0, y: 0}
            };
            this.dmScale = 0;
            this.current = -1;

            this.initEvents();
            requestAnimationFrame(() => this.render());
        }
        initEvents() {
            window.addEventListener('mousemove', ev => this.mousePos = getMousePos(ev));

            this.DOM.menuLinks.forEach((item, pos) => {
                const mouseenterFn = () => {
                    if ( this.current !== -1 ) {
                       TweenMax.set(this.DOM.imgs[this.current], {opacity: 0});
                    }
                    this.current = pos;

                    if ( this.fade ) {
                        TweenMax.to(this.DOM.imgs[this.current], 0.5, {ease: Quad.easeOut, opacity: 1});
                        this.fade = false;
                    }
                    else {
                        TweenMax.set(this.DOM.imgs[this.current], {opacity: 1});
                    }
                };
                item.addEventListener('mouseenter', mouseenterFn);
            });

            const mousemenuenterFn = () => this.fade = true;
            const mousemenuleaveFn = () => TweenMax.to(this.DOM.imgs[this.current], .2, {ease: Quad.easeOut, opacity: 0});

            this.DOM.menu.addEventListener('mouseenter', mousemenuenterFn);
            this.DOM.menu.addEventListener('mouseleave', mousemenuleaveFn);
        }
        render() {
            this.lastMousePos.translation.x = lerp(this.lastMousePos.translation.x, this.mousePos.x, 0.2);
            this.lastMousePos.translation.y = lerp(this.lastMousePos.translation.y, this.mousePos.y, 0.2);
            this.DOM.svg.style.transform = `translateX(${(this.lastMousePos.translation.x-winsize.width/2)}px) translateY(${this.lastMousePos.translation.y-winsize.height/2}px)`;

            this.lastMousePos.displacement.x = lerp(this.lastMousePos.displacement.x, this.mousePos.x, 0.1);
            this.lastMousePos.displacement.y = lerp(this.lastMousePos.displacement.y, this.mousePos.y, 0.1);
            const mouseDistance = distance(this.lastMousePos.displacement.x, this.mousePos.x, this.lastMousePos.displacement.y, this.mousePos.y);
            this.dmScale = Math.min(lineEq(50, 0, 140, 0, mouseDistance), 50);
            feDisplacementMapEl.scale.baseVal = this.dmScale;

            requestAnimationFrame(() => this.render());
        }
    }

    new Menu();
}
