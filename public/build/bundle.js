
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z$5 = "/*\n! tailwindcss v3.0.23 | MIT License | https://tailwindcss.com\n*//*\n1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)\n2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)\n*/\n\n*,\n::before,\n::after {\n  box-sizing: border-box; /* 1 */\n  border-width: 0; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: currentColor; /* 2 */\n}\n\n::before,\n::after {\n  --tw-content: '';\n}\n\n/*\n1. Use a consistent sensible line-height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n3. Use a more readable tab size.\n4. Use the user's configured `sans` font-family by default.\n*/\n\nhtml {\n  line-height: 1.5; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n  -moz-tab-size: 4; /* 3 */\n  -o-tab-size: 4;\n     tab-size: 4; /* 3 */\n  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"; /* 4 */\n}\n\n/*\n1. Remove the margin in all browsers.\n2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.\n*/\n\nbody {\n  margin: 0; /* 1 */\n  line-height: inherit; /* 2 */\n}\n\n/*\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n3. Ensure horizontal rules are visible by default.\n*/\n\nhr {\n  height: 0; /* 1 */\n  color: inherit; /* 2 */\n  border-top-width: 1px; /* 3 */\n}\n\n/*\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n\nabbr:where([title]) {\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n}\n\n/*\nRemove the default font size and weight for headings.\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\n/*\nReset links to optimize for opt-in styling instead of opt-out.\n*/\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\n/*\nAdd the correct font weight in Edge and Safari.\n*/\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/*\n1. Use the user's configured `mono` font family by default.\n2. Correct the odd `em` font sizing in all browsers.\n*/\n\ncode,\nkbd,\nsamp,\npre {\n  font-family: Roboto Mono; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/*\nAdd the correct font size in all browsers.\n*/\n\nsmall {\n  font-size: 80%;\n}\n\n/*\nPrevent `sub` and `sup` elements from affecting the line height in all browsers.\n*/\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/*\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n3. Remove gaps between table borders by default.\n*/\n\ntable {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n  border-collapse: collapse; /* 3 */\n}\n\n/*\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n3. Remove default padding in all browsers.\n*/\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  line-height: inherit; /* 1 */\n  color: inherit; /* 1 */\n  margin: 0; /* 2 */\n  padding: 0; /* 3 */\n}\n\n/*\nRemove the inheritance of text transform in Edge and Firefox.\n*/\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Remove default button styles.\n*/\n\nbutton,\n[type='button'],\n[type='reset'],\n[type='submit'] {\n  -webkit-appearance: button; /* 1 */\n  background-color: transparent; /* 2 */\n  background-image: none; /* 2 */\n}\n\n/*\nUse the modern Firefox focus style for all focusable elements.\n*/\n\n:-moz-focusring {\n  outline: auto;\n}\n\n/*\nRemove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)\n*/\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\n/*\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n\nprogress {\n  vertical-align: baseline;\n}\n\n/*\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/*\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n\n[type='search'] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/*\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to `inherit` in Safari.\n*/\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/*\nAdd the correct display in Chrome and Safari.\n*/\n\nsummary {\n  display: list-item;\n}\n\n/*\nRemoves the default spacing and border for appropriate elements.\n*/\n\nblockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol,\nul,\nmenu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n/*\nPrevent resizing textareas horizontally by default.\n*/\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)\n2. Set the default placeholder color to the user's configured gray 400 color.\n*/\n\ninput::-moz-placeholder, textarea::-moz-placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\ninput:-ms-input-placeholder, textarea:-ms-input-placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\ninput::placeholder,\ntextarea::placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\n/*\nSet the default cursor for buttons.\n*/\n\nbutton,\n[role=\"button\"] {\n  cursor: pointer;\n}\n\n/*\nMake sure disabled buttons don't get the pointer cursor.\n*/\n:disabled {\n  cursor: default;\n}\n\n/*\n1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)\n2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)\n   This can trigger a poorly considered lint error in some tools but is included by design.\n*/\n\nimg,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block; /* 1 */\n  vertical-align: middle; /* 2 */\n}\n\n/*\nConstrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)\n*/\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n\n/*\nEnsure the default browser behavior of the `hidden` attribute.\n*/\n\n[hidden] {\n  display: none;\n}\n\n*, ::before, ::after {\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n.visible {\n  visibility: visible;\n}\n.absolute {\n  position: absolute;\n}\n.relative {\n  position: relative;\n}\n.sticky {\n  position: -webkit-sticky;\n  position: sticky;\n}\n.inset-0 {\n  top: 0px;\n  right: 0px;\n  bottom: 0px;\n  left: 0px;\n}\n.top-6 {\n  top: 1.5rem;\n}\n.top-0 {\n  top: 0px;\n}\n.left-3 {\n  left: 0.75rem;\n}\n.z-10 {\n  z-index: 10;\n}\n.-z-10 {\n  z-index: -10;\n}\n.mx-6 {\n  margin-left: 1.5rem;\n  margin-right: 1.5rem;\n}\n.mx-auto {\n  margin-left: auto;\n  margin-right: auto;\n}\n.-my-px {\n  margin-top: -1px;\n  margin-bottom: -1px;\n}\n.mr-3 {\n  margin-right: 0.75rem;\n}\n.mb-28 {\n  margin-bottom: 7rem;\n}\n.mb-2 {\n  margin-bottom: 0.5rem;\n}\n.mr-1 {\n  margin-right: 0.25rem;\n}\n.mr-6 {\n  margin-right: 1.5rem;\n}\n.mb-4 {\n  margin-bottom: 1rem;\n}\n.flex {\n  display: flex;\n}\n.h-full {\n  height: 100%;\n}\n.max-h-full {\n  max-height: 100%;\n}\n.min-h-screen {\n  min-height: 100vh;\n}\n.min-h-full {\n  min-height: 100%;\n}\n.w-full {\n  width: 100%;\n}\n.w-56 {\n  width: 14rem;\n}\n.w-auto {\n  width: auto;\n}\n.max-w-5xl {\n  max-width: 64rem;\n}\n.flex-grow {\n  flex-grow: 1;\n}\n.transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.flex-col {\n  flex-direction: column;\n}\n.flex-wrap {\n  flex-wrap: wrap;\n}\n.items-center {\n  align-items: center;\n}\n.justify-end {\n  justify-content: flex-end;\n}\n.justify-center {\n  justify-content: center;\n}\n.gap-6 {\n  gap: 1.5rem;\n}\n.overflow-hidden {\n  overflow: hidden;\n}\n.overflow-y-auto {\n  overflow-y: auto;\n}\n.bg-primary {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 253 163 / var(--tw-bg-opacity));\n}\n.p-4 {\n  padding: 1rem;\n}\n.p-2 {\n  padding: 0.5rem;\n}\n.p-6 {\n  padding: 1.5rem;\n}\n.pt-16 {\n  padding-top: 4rem;\n}\n.font-mono {\n  font-family: Roboto Mono;\n}\n.text-sm {\n  font-size: 0.875rem;\n  line-height: 1.25rem;\n}\n.text-4xl {\n  font-size: 2.25rem;\n  line-height: 2.5rem;\n}\n.font-light {\n  font-weight: 300;\n}\n.font-bold {\n  font-weight: 700;\n}\n.tracking-widest {\n  letter-spacing: 0.1em;\n}\n.underline {\n  -webkit-text-decoration-line: underline;\n          text-decoration-line: underline;\n}\n.transition {\n  transition-property: color, background-color, border-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-text-decoration-color, -webkit-backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-text-decoration-color, -webkit-backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.hover\\:underline:hover {\n  -webkit-text-decoration-line: underline;\n          text-decoration-line: underline;\n}\n@media (min-width: 640px) {\n\n  .sm\\:w-120 {\n    width: 30rem;\n  }\n\n  .sm\\:flex-row {\n    flex-direction: row;\n  }\n}\n@media (min-width: 768px) {\n\n  .md\\:top-12 {\n    top: 3rem;\n  }\n\n  .md\\:mx-12 {\n    margin-left: 3rem;\n    margin-right: 3rem;\n  }\n\n  .md\\:text-2xl {\n    font-size: 1.5rem;\n    line-height: 2rem;\n  }\n\n  .md\\:text-base {\n    font-size: 1rem;\n    line-height: 1.5rem;\n  }\n\n  .md\\:text-8xl {\n    font-size: 6rem;\n    line-height: 1;\n  }\n}";
    styleInject(css_248z$5);

    var css_248z$4 = "* {\n  font-family: 'Roboto Mono', monospace;\n}";
    styleInject(css_248z$4);

    var css_248z$3 = "\n  :root {\n    --transition-bottle-falling: 0.5s;\n    --transition-bottle-delay: 0.7s;\n    --transition-water-rising: 1s;\n    --transition-water-rising-delay: 1.2s;\n  }";
    styleInject(css_248z$3);

    var css_248z$2 = ".water.svelte-19b5t91{transition:all var(--transition-bottle-falling);fill:none;stroke-linecap:round;stroke-width:3;stroke-dasharray:620, 620;stroke-dashoffset:620;stroke:#f2e418;}.water.flows.svelte-19b5t91{stroke-dashoffset:0}.bottle.svelte-19b5t91{transition:var(--transition-bottle-falling) cubic-bezier(1, 0, 1, 1);transform-origin:bottom right;transform-box:fill-box;transform:rotate(0);stroke:#000;}.bottle.falls-over.svelte-19b5t91{transform:rotate(90deg)}.liquid.svelte-19b5t91{fill:#f2e418;}.cap.svelte-19b5t91{fill:#000;}.label.svelte-19b5t91{fill:#fff;stroke:#000;}.delayed.svelte-19b5t91{transition-delay:var(--transition-bottle-delay)}";
    styleInject(css_248z$2);

    /* src\components\Logo.svelte generated by Svelte v3.47.0 */
    const file$8 = "src\\components\\Logo.svelte";

    function create_fragment$8(ctx) {
    	let svg;
    	let path0;
    	let g1;
    	let path1;
    	let path2;
    	let g0;
    	let path3;
    	let circle;
    	let path4;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			g1 = svg_element("g");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			g0 = svg_element("g");
    			path3 = svg_element("path");
    			circle = svg_element("circle");
    			path4 = svg_element("path");
    			attr_dev(path0, "id", "water");
    			attr_dev(path0, "class", "water delayed svelte-19b5t91");
    			attr_dev(path0, "d", "M 50 25 C 60 25 66 44 66 620");
    			toggle_class(path0, "flows", /*tilt*/ ctx[0]);
    			add_location(path0, file$8, 25, 2, 577);
    			attr_dev(path1, "class", "liquid svelte-19b5t91");
    			attr_dev(path1, "d", "M 16 33 h -16 v -24 c 0 -2 2 -3 5 -5 v -4 h 6 v 4 c 3 2 5 3 5 5 Z");
    			add_location(path1, file$8, 39, 4, 776);
    			attr_dev(path2, "class", "cap svelte-19b5t91");
    			attr_dev(path2, "d", "M 5 1 V 0 H 11 V 1 Z");
    			add_location(path2, file$8, 45, 4, 902);
    			attr_dev(path3, "d", "M 0 13 H 16 V 23 H 0 Z");
    			add_location(path3, file$8, 54, 6, 1015);
    			attr_dev(circle, "cx", "8");
    			attr_dev(circle, "cy", "18");
    			attr_dev(circle, "r", "3");
    			add_location(circle, file$8, 58, 6, 1090);
    			attr_dev(path4, "d", "M 4 21 l 8 -6");
    			add_location(path4, file$8, 59, 6, 1127);
    			attr_dev(g0, "class", "label svelte-19b5t91");
    			add_location(g0, file$8, 51, 4, 980);
    			attr_dev(g1, "id", "bottle");
    			attr_dev(g1, "class", "bottle svelte-19b5t91");
    			toggle_class(g1, "falls-over", /*tilt*/ ctx[0]);
    			add_location(g1, file$8, 33, 2, 701);
    			attr_dev(svg, "viewBox", "-2 -5 70 620");
    			attr_dev(svg, "class", "absolute -z-10 max-h-full w-56 left-3");
    			attr_dev(svg, "preserveAspectRatio", "xMinYMin meet");
    			add_location(svg, file$8, 24, 0, 464);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, g1);
    			append_dev(g1, path1);
    			append_dev(g1, path2);
    			append_dev(g1, g0);
    			append_dev(g0, path3);
    			append_dev(g0, circle);
    			append_dev(g0, path4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tilt*/ 1) {
    				toggle_class(path0, "flows", /*tilt*/ ctx[0]);
    			}

    			if (dirty & /*tilt*/ 1) {
    				toggle_class(g1, "falls-over", /*tilt*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Logo', slots, []);
    	let { tilt = false } = $$props;
    	let bottle;
    	let water;

    	onMount(() => {
    		bottle = document.getElementById('bottle');
    		water = document.getElementById('water');
    	});

    	afterUpdate(() => {
    		if (tilt) {
    			water.classList.add("delayed");
    			bottle.classList.remove("delayed");
    		} else {
    			bottle.classList.add("delayed");
    			water.classList.remove("delayed");
    		}
    	});

    	const writable_props = ['tilt'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Logo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('tilt' in $$props) $$invalidate(0, tilt = $$props.tilt);
    	};

    	$$self.$capture_state = () => ({
    		tilt,
    		afterUpdate,
    		onMount,
    		bottle,
    		water
    	});

    	$$self.$inject_state = $$props => {
    		if ('tilt' in $$props) $$invalidate(0, tilt = $$props.tilt);
    		if ('bottle' in $$props) bottle = $$props.bottle;
    		if ('water' in $$props) water = $$props.water;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tilt];
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { tilt: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logo",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get tilt() {
    		throw new Error("<Logo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tilt(value) {
    		throw new Error("<Logo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Background.svelte generated by Svelte v3.47.0 */

    const file$7 = "src\\components\\Background.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let h1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "SUPERMITTEL";
    			attr_dev(h1, "class", "font-light text-4xl md:text-8xl tracking-widest");
    			add_location(h1, file$7, 1, 2, 70);
    			attr_dev(div, "class", "min-h-screen inset-0 flex justify-center items-center");
    			add_location(div, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Background', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Background> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Background extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Background",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    var css_248z$1 = ".wave.svelte-1uj4cqz,.water.svelte-1uj4cqz{-webkit-animation-duration:10s;animation-duration:10s;-webkit-animation-timing-function:linear;animation-timing-function:linear;-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite;}.wave.svelte-1uj4cqz, .water.svelte-1uj4cqz{fill:#FFFDA3;}.wave.svelte-1uj4cqz{-webkit-animation-name:svelte-1uj4cqz-waving;animation-name:svelte-1uj4cqz-waving;-webkit-animation-timing-function:linear;animation-timing-function:linear;transform:scaleY(0) translate(0)}@-webkit-keyframes svelte-1uj4cqz-waving{0%{transform:scaleY(0) translate(0)}25%{transform:scaleY(1.2) translate(25%)}50%{transform:scaleY(0) translate(50%)}75%{transform:scaleY(1.2) translate(75%)}100%{transform:scaleY(0) translate(100%)}}@keyframes svelte-1uj4cqz-waving{0%{transform:scaleY(0) translate(0)}25%{transform:scaleY(1.2) translate(25%)}50%{transform:scaleY(0) translate(50%)}75%{transform:scaleY(1.2) translate(75%)}100%{transform:scaleY(0) translate(100%)}}.water.svelte-1uj4cqz{-webkit-animation-name:svelte-1uj4cqz-water;animation-name:svelte-1uj4cqz-water;transform:translateY(50%)}@-webkit-keyframes svelte-1uj4cqz-water{0%{transform:translateY(0)}25%{transform:translateY(50%)}50%{transform:translateY(0)}75%{transform:translateY(50%)}100%{transform:translateY(0)}}@keyframes svelte-1uj4cqz-water{0%{transform:translateY(0)}25%{transform:translateY(50%)}50%{transform:translateY(0)}75%{transform:translateY(50%)}100%{transform:translateY(0)}}";
    styleInject(css_248z$1);

    /* src\components\Wave.svelte generated by Svelte v3.47.0 */

    const file$6 = "src\\components\\Wave.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "class", "wave svelte-1uj4cqz");
    			attr_dev(path0, "d", "M -30 0 c 15 -3 15 3 30 0 c 15 -3 15 3 30 0 v 3 h -60 z");
    			add_location(path0, file$6, 1, 2, 28);
    			attr_dev(path1, "class", "water svelte-1uj4cqz");
    			attr_dev(path1, "d", "M -30 3 v -3 h 60  v 3 z");
    			add_location(path1, file$6, 6, 2, 131);
    			attr_dev(svg, "viewBox", "0 -1 30 2");
    			add_location(svg, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Wave', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Wave> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Wave extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wave",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\Speisekammer.svelte generated by Svelte v3.47.0 */

    const file$5 = "src\\components\\Speisekammer.svelte";

    function create_fragment$5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "sizes", "(max-width: 1400px) 100vw, 1400px");
    			attr_dev(img, "srcset", "\nimages/speisekammer-konstanz.de__1_e98qqq_c_scale,w_200.png 200w,\nimages/speisekammer-konstanz.de__1_e98qqq_c_scale,w_602.png 602w,\nimages/speisekammer-konstanz.de__1_e98qqq_c_scale,w_865.png 865w,\nimages/speisekammer-konstanz.de__1_e98qqq_c_scale,w_1133.png 1133w,\nimages/speisekammer-konstanz.de__1_e98qqq_c_scale,w_1400.png 1400w");
    			if (!src_url_equal(img.src, img_src_value = "images/speisekammer-konstanz.de__1_e98qqq_c_scale,w_1400.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 1, 0, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Speisekammer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Speisekammer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Speisekammer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Speisekammer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Kulturkiosk.svelte generated by Svelte v3.47.0 */

    const file$4 = "src\\components\\Kulturkiosk.svelte";

    function create_fragment$4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "sizes", "(max-width: 1400px) 100vw, 1400px");
    			attr_dev(img, "srcset", "\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_200.png 200w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_415.png 415w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_574.png 574w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_714.png 714w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_826.png 826w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_926.png 926w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_1016.png 1016w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_1106.png 1106w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_1197.png 1197w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_1271.png 1271w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_1349.png 1349w,\nimages/kulturkiosk-schranke.de__reswj7_c_scale,w_1400.png 1400w");
    			if (!src_url_equal(img.src, img_src_value = "images/kulturkiosk-schranke.de__reswj7_c_scale,w_1400.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Kulturkiosk', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Kulturkiosk> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Kulturkiosk extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Kulturkiosk",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Barac.svelte generated by Svelte v3.47.0 */

    const file$3 = "src\\components\\Barac.svelte";

    function create_fragment$3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "sizes", "(max-width: 1400px) 100vw, 1400px");
    			attr_dev(img, "srcset", "\nimages/www.barac-mannheim.com__wy1que_c_scale,w_200.png 200w,\nimages/www.barac-mannheim.com__wy1que_c_scale,w_458.png 458w,\nimages/www.barac-mannheim.com__wy1que_c_scale,w_637.png 637w,\nimages/www.barac-mannheim.com__wy1que_c_scale,w_798.png 798w,\nimages/www.barac-mannheim.com__wy1que_c_scale,w_937.png 937w,\nimages/www.barac-mannheim.com__wy1que_c_scale,w_1053.png 1053w,\nimages/www.barac-mannheim.com__wy1que_c_scale,w_1159.png 1159w,\nimages/www.barac-mannheim.com__wy1que_c_scale,w_1264.png 1264w,\nimages/www.barac-mannheim.com__wy1que_c_scale,w_1367.png 1367w,\nimages/www.barac-mannheim.com__wy1que_c_scale,w_1400.png 1400w");
    			if (!src_url_equal(img.src, img_src_value = "images/www.barac-mannheim.com__wy1que_c_scale,w_1400.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Barac', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Barac> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Barac extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Barac",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Project.svelte generated by Svelte v3.47.0 */

    const file$2 = "src\\components\\Project.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let a;
    	let div0;
    	let p0;
    	let t0;
    	let t1;
    	let svg;
    	let path;
    	let t2;
    	let div1;
    	let switch_instance;
    	let t3;
    	let p1;
    	let t4;
    	let current;
    	var switch_value = /*image*/ ctx[1];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			a = element("a");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t2 = space();
    			div1 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(/*text*/ ctx[2]);
    			attr_dev(p0, "class", "underline mr-1");
    			add_location(p0, file$2, 10, 4, 190);
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M 14 4 V 5 H 18.3 L 8.3 15 L 9 15.7 L 19 5.7 V 10 H 20 V 4 M 19 19 H 5 V 5 H 12 V 4 H 5 C 4 4 4 4 4 5 V 19 A 1 1 0 0 0 5 20 H 19 A 1 1 0 0 0 20 19 V 12 H 19 V 19 Z");
    			add_location(path, file$2, 12, 6, 295);
    			set_style(svg, "width", "24px");
    			set_style(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$2, 11, 4, 232);
    			attr_dev(div0, "class", "flex mb-2");
    			add_location(div0, file$2, 9, 4, 161);
    			attr_dev(div1, "class", "mb-4");
    			add_location(div1, file$2, 15, 2, 531);
    			attr_dev(a, "href", /*href*/ ctx[3]);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 8, 2, 130);
    			attr_dev(p1, "class", "text-sm md:text-base");
    			add_location(p1, file$2, 19, 2, 603);
    			attr_dev(div2, "class", "w-auto sm:w-120");
    			add_location(div2, file$2, 7, 0, 98);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(a, t2);
    			append_dev(a, div1);

    			if (switch_instance) {
    				mount_component(switch_instance, div1, null);
    			}

    			append_dev(div2, t3);
    			append_dev(div2, p1);
    			append_dev(p1, t4);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (switch_value !== (switch_value = /*image*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div1, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (!current || dirty & /*href*/ 8) {
    				attr_dev(a, "href", /*href*/ ctx[3]);
    			}

    			if (!current || dirty & /*text*/ 4) set_data_dev(t4, /*text*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Project', slots, []);
    	let { title } = $$props;
    	let { image } = $$props;
    	let { text } = $$props;
    	let { href } = $$props;
    	const writable_props = ['title', 'image', 'text', 'href'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('image' in $$props) $$invalidate(1, image = $$props.image);
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    		if ('href' in $$props) $$invalidate(3, href = $$props.href);
    	};

    	$$self.$capture_state = () => ({ title, image, text, href });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('image' in $$props) $$invalidate(1, image = $$props.image);
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    		if ('href' in $$props) $$invalidate(3, href = $$props.href);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, image, text, href];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { title: 0, image: 1, text: 2, href: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<Project> was created without expected prop 'title'");
    		}

    		if (/*image*/ ctx[1] === undefined && !('image' in props)) {
    			console.warn("<Project> was created without expected prop 'image'");
    		}

    		if (/*text*/ ctx[2] === undefined && !('text' in props)) {
    			console.warn("<Project> was created without expected prop 'text'");
    		}

    		if (/*href*/ ctx[3] === undefined && !('href' in props)) {
    			console.warn("<Project> was created without expected prop 'href'");
    		}
    	}

    	get title() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Content.svelte generated by Svelte v3.47.0 */
    const file$1 = "src\\components\\Content.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (38:4) {#each projects as project}
    function create_each_block(ctx) {
    	let project;
    	let current;
    	const project_spread_levels = [/*project*/ ctx[1]];
    	let project_props = {};

    	for (let i = 0; i < project_spread_levels.length; i += 1) {
    		project_props = assign(project_props, project_spread_levels[i]);
    	}

    	project = new Project({ props: project_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(project.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(project, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const project_changes = (dirty & /*projects*/ 1)
    			? get_spread_update(project_spread_levels, [get_spread_object(/*project*/ ctx[1])])
    			: {};

    			project.$set(project_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(project.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(project.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(project, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(38:4) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let each_value = /*projects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex gap-6 flex-col sm:flex-row flex-wrap");
    			add_location(div0, file$1, 36, 2, 1293);
    			attr_dev(div1, "class", "p-6 flex-grow overflow-y-auto bg-primary");
    			add_location(div1, file$1, 35, 0, 1236);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*projects*/ 1) {
    				each_value = /*projects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Content', slots, []);

    	const projects = [
    		{
    			title: 'Kulturkiosk Schranke',
    			image: Kulturkiosk,
    			href: 'https://kulturkiosk-schranke.de/',
    			text: `Der Kulturkiosk Schranke ist ein Nachbarschaftsprojekt in Konstanz,
        Petershausen-West. Neben einem nachhaltigen Produktsortiment finden
        auch regelmäßig Events und Workshops statt.`
    		},
    		{
    			title: 'Speisekammer Konstanz',
    			image: Speisekammer,
    			href: 'https://speisekammer-konstanz.de/',
    			text: `Die Speisekammer Konstanz ist ein Verein,
        der sich als Einkaufsgemeinschaft die Förderung 
        eines Lebensmittelsystems zum Wohle des Lebens von
        Menschen, Tieren und Pflanzen zum Zweck gemacht hat.`
    		},
    		{
    			title: 'barac Mannheim',
    			image: Barac,
    			href: 'http://www.barac-mannheim.com/',
    			text: `barac ist temporäres Künstleratelier, Werkstatt, Manufaktur,
        Erdlabor, Farblabor, Küchenlabor, Inklusion und Wohnen. (Quelle: barac mannheim)
        Gestaltung ist von Raum Mannheim`
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Speisekammer,
    		Kulturkiosk,
    		Barac,
    		Project,
    		projects
    	});

    	return [projects];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var css_248z = ".content.svelte-116q6uy{top:92%;transition:var(--transition-water-rising) linear;transition-delay:var(--transition-water-rising-delay)}.content.visible.svelte-116q6uy{top:0}";
    styleInject(css_248z);

    /* src\App.svelte generated by Svelte v3.47.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let logo;
    	let updating_tilt;
    	let t0;
    	let nav_1;
    	let button0;
    	let t2;
    	let button1;
    	let t4;
    	let main;
    	let background;
    	let t5;
    	let div0;
    	let p;
    	let b;
    	let t7;
    	let a0;
    	let t9;
    	let t10;
    	let div2;
    	let wave;
    	let t11;
    	let div1;
    	let t12;
    	let content_1;
    	let t13;
    	let footer;
    	let a1;
    	let current;
    	let mounted;
    	let dispose;

    	function logo_tilt_binding(value) {
    		/*logo_tilt_binding*/ ctx[3](value);
    	}

    	let logo_props = {};

    	if (/*tilt*/ ctx[0] !== void 0) {
    		logo_props.tilt = /*tilt*/ ctx[0];
    	}

    	logo = new Logo({ props: logo_props, $$inline: true });
    	binding_callbacks.push(() => bind(logo, 'tilt', logo_tilt_binding));
    	background = new Background({ $$inline: true });
    	wave = new Wave({ $$inline: true });
    	content_1 = new Content({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(logo.$$.fragment);
    			t0 = space();
    			nav_1 = element("nav");
    			button0 = element("button");
    			button0.textContent = "Projekte";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "About";
    			t4 = space();
    			main = element("main");
    			create_component(background.$$.fragment);
    			t5 = space();
    			div0 = element("div");
    			p = element("p");
    			b = element("b");
    			b.textContent = "Supermittel";
    			t7 = text(" ist ein Kleinunternehmen in Konstanz, das ehrenamtlich soziale Projekte unterstützt.\n\t\t\tGerne beraten wir dich zu deinen Fragen rund um das Thema Digitalisierung und kümmern uns um die Programmierung deiner Website.\n\t\t\tBei Bedarf können wir dich auch bei der visuellen Gestaltung unterstützen.\n\t\t\tFalls du Interesse hast, melde dich einfach unverbindlich unter: ");
    			a0 = element("a");
    			a0.textContent = "markus@supermittel.com";
    			t9 = text(".");
    			t10 = space();
    			div2 = element("div");
    			create_component(wave.$$.fragment);
    			t11 = space();
    			div1 = element("div");
    			t12 = space();
    			create_component(content_1.$$.fragment);
    			t13 = space();
    			footer = element("footer");
    			a1 = element("a");
    			a1.textContent = "Impressum";
    			attr_dev(button0, "class", "hover:underline md:text-2xl mr-6");
    			toggle_class(button0, "font-bold", /*tilt*/ ctx[0]);
    			add_location(button0, file, 42, 1, 825);
    			attr_dev(button1, "class", "hover:underline md:text-2xl");
    			add_location(button1, file, 49, 1, 955);
    			attr_dev(nav_1, "id", "nav");
    			attr_dev(nav_1, "class", "flex sticky top-6 md:top-12 justify-end mx-6 md:mx-12 z-10");
    			add_location(nav_1, file, 37, 0, 738);
    			add_location(b, file, 63, 3, 1253);
    			attr_dev(a0, "href", "mailto:markus@supermittel.com");
    			attr_dev(a0, "class", "underline");
    			add_location(a0, file, 66, 68, 1634);
    			attr_dev(p, "class", "text-sm md:text-base");
    			add_location(p, file, 62, 2, 1217);
    			attr_dev(div0, "class", "mb-28 p-4 max-w-5xl w-full mx-auto");
    			add_location(div0, file, 61, 1, 1166);
    			attr_dev(div1, "class", "-my-px pt-16 bg-primary");
    			add_location(div1, file, 77, 2, 1875);
    			attr_dev(a1, "href", "/impressum");
    			add_location(a1, file, 82, 3, 1980);
    			attr_dev(footer, "class", "bg-primary p-2");
    			add_location(footer, file, 81, 2, 1945);
    			attr_dev(div2, "id", "content");
    			attr_dev(div2, "class", "content absolute top-0 h-full w-full flex flex-col flex-grow svelte-116q6uy");
    			toggle_class(div2, "visible", /*tilt*/ ctx[0]);
    			add_location(div2, file, 70, 1, 1737);
    			attr_dev(main, "class", "min-h-full flex flex-col flex-grow overflow-hidden relative");
    			add_location(main, file, 58, 0, 1062);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(logo, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, nav_1, anchor);
    			append_dev(nav_1, button0);
    			append_dev(nav_1, t2);
    			append_dev(nav_1, button1);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(background, main, null);
    			append_dev(main, t5);
    			append_dev(main, div0);
    			append_dev(div0, p);
    			append_dev(p, b);
    			append_dev(p, t7);
    			append_dev(p, a0);
    			append_dev(p, t9);
    			append_dev(main, t10);
    			append_dev(main, div2);
    			mount_component(wave, div2, null);
    			append_dev(div2, t11);
    			append_dev(div2, div1);
    			append_dev(div2, t12);
    			mount_component(content_1, div2, null);
    			append_dev(div2, t13);
    			append_dev(div2, footer);
    			append_dev(footer, a1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*toggleTilt*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*scrollToBottom*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const logo_changes = {};

    			if (!updating_tilt && dirty & /*tilt*/ 1) {
    				updating_tilt = true;
    				logo_changes.tilt = /*tilt*/ ctx[0];
    				add_flush_callback(() => updating_tilt = false);
    			}

    			logo.$set(logo_changes);

    			if (dirty & /*tilt*/ 1) {
    				toggle_class(button0, "font-bold", /*tilt*/ ctx[0]);
    			}

    			if (dirty & /*tilt*/ 1) {
    				toggle_class(div2, "visible", /*tilt*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			transition_in(background.$$.fragment, local);
    			transition_in(wave.$$.fragment, local);
    			transition_in(content_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(background.$$.fragment, local);
    			transition_out(wave.$$.fragment, local);
    			transition_out(content_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(logo, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(nav_1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(main);
    			destroy_component(background);
    			destroy_component(wave);
    			destroy_component(content_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let tilt = true;
    	let content;
    	let nav;

    	onMount(() => {
    		content = document.getElementById('content');
    		nav = document.getElementById('nav');
    	});

    	const toggleTilt = () => {
    		$$invalidate(0, tilt = !tilt);
    	};

    	const scrollToBottom = () => {
    		$$invalidate(0, tilt = false);

    		window.scrollTo({
    			left: 0,
    			top: document.body.scrollHeight,
    			behavior: 'smooth'
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function logo_tilt_binding(value) {
    		tilt = value;
    		$$invalidate(0, tilt);
    	}

    	$$self.$capture_state = () => ({
    		Logo,
    		Background,
    		Wave,
    		Content,
    		onMount,
    		tilt,
    		content,
    		nav,
    		toggleTilt,
    		scrollToBottom
    	});

    	$$self.$inject_state = $$props => {
    		if ('tilt' in $$props) $$invalidate(0, tilt = $$props.tilt);
    		if ('content' in $$props) content = $$props.content;
    		if ('nav' in $$props) nav = $$props.nav;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tilt, toggleTilt, scrollToBottom, logo_tilt_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
