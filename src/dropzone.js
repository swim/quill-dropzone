/**
 * @file
 * dropzone.js
 *
 * @package
 * Quill
 *
 * @module
 * QuillDropzone
 *
 * Provides Dropzone integration with Quill editor.
 */
var Dropzone = require('dropzone');

class QuillDropzone {
  constructor(quill, options) {
    this.quill = quill;
    this.options = options;
    this.active = false;

    // This is a self-contained module; but we still want the
    // tooltip container.
    this.container = this.quill.addContainer('ql-tooltip');
    this.container.classList.add('ql-dropzone-tooltip');
    this.container.innerHTML = this.options.template;

    // Dropzone instance.
    this.dropzone = new Dropzone(options.container, options.config);

    // Attach event listeners.
    this.initListeners();

    // Hide on load.
    this._hide();
  }

  initListeners() {
    this.quill.onModuleLoad('toolbar', (toolbar) => {
      this.toolbar = toolbar;
      toolbar.initFormat('dropzone', this._toggle.bind(this));
    });

    this.quill.on('selection-change', function(range) {
      this.range = range;
    }.bind(this))

    // Refocus the position oncomplete.
    this.dropzone.on('complete', function(file) {
      this._show();
    }.bind(this))
  }

  /**
   * Insert the uploaded asset.
   */
  insert(e) {
    e.preventDefault();

    // Insert the image.
    // @todo, support other media types.
    if (this.range != null && e.target.href) {
      let start = this.range.start;
      this.quill.insertEmbed(start, 'image', e.target.href);
      this.quill.setSelection(start + 1, start + 1);
    }
    else if (e.target.href) {
      this.quill.insertEmbed(0, 'image', e.target.href);
    }
  }

  /**
   * Actions to insert.
   *
   * @param element htmlElement
   * @param location string
   */
  actions(element, location) {
    let insert = document.createElement('a')
    insert.text = 'Insert'
    insert.href = location
    insert.classList.add('insert', 'dropzone-button')
    insert.addEventListener('click', this.insert.bind(this))
    element.appendChild(insert);
  }

  _toggle(range) {
    if (range == null) return;
    this.active ? this._hide() : this._show();
  }

  _show() {
    this.active = true;
    this.position = Quill.modules.tooltip.prototype.position;
    Quill.modules.tooltip.prototype.show.call(this);
  }

  _hide() {
    this.active = false;
    Quill.modules.tooltip.prototype.hide.call(this);
  }

}
QuillDropzone.DEFAULTS = {
  template: '<form action="/file" class="dropzone-upload dropzone"><div class="fallback"><input name="file" type="file" multiple /></div></form>'
};

Quill.registerModule('dropzone', QuillDropzone);

module.exports = QuillDropzone;