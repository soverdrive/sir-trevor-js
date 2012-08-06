/*
  Sir Trevor Editor
  -- 
  Represents one Sir Trevor editor instance (with multiple blocks)
  Each block references this instance. 
  BlockTypes are global however.
*/

var SirTrevorEditor = SirTrevor.Editor = function(options) {
  this.blockTypes = {};
  this.formatters = {};
  this.blocks = {};
  this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
  this.ID = _.uniqueId(this.options.baseCSSClass + "-");
  this._ensureAndSetElements();
  this._setBlocksAndFormatters();
  this._bindFunctions();
  this.build();
};

_.extend(SirTrevorEditor.prototype, {
  
  bound: ['onFormSubmit'],
  
  initialize: function() {},
  
  build: function() {
    // Create a default instance
    this.createBlock(this.options.defaultType);
    this.attach();
  },
  
  attach: function() {
    this.$form.on('submit', this.onFormSubmit);
  },
  
  createBlock: function(type) {
    if (this._blockTypeAvailable(type)) {
      
     var blockType = SirTrevor.BlockTypes[type],
         currentBlockCount = (_.isUndefined(this.blocks[type])) ? 0 : this.blocks[type].length;
     
     // Can we have another one of these blocks?
     if (currentBlockCount > blockType.limit) {
       return false;
     }
     
     if (currentBlockCount + 1 == blockType.limit) {
       this.marker.find('[data-type="' + type + '"]')
                  .addClass('inactive')
                  .attr('title','You have reached the limit for this type of block');
     }
     
     var block = new SirTrevor.Block(this, blockType, {});  
     
     if (_.isUndefined(this.blocks[type])) {
       this.blocks[type] = [];
     }
     
     this.blocks[type].push(block);
    }
  },
  
  removeBlock: function(block) {
    if (!_.isUndefined(this.blocks[block.type][block.ID])) {
      block.remove();
      this.blocks[type][name] = null;
    }
  },
  
  /* Handlers */
  
  onFormSubmit: function(e) {
    
    e.preventDefault();
    
    var blockLength, block, result;

    this.options.blockStore.data = [];
    
    // Loop through blocks to validate
    for (var type in this.blocks) {
      
      if (this.blocks.hasOwnProperty(type)) {
        blockLength = this.blocks[type].length;

        for (var i = 0; i < blockLength; i++) {
          
          block = this.blocks[type][i];
          result = block.validate();
          
          if (!result) {
            console.log(block.errors); // Show our errors.
          } else {
            block.serialize();
          }
        } 
      }
    }
    
    return false;
  },
  
  /* Privates */
  
  _blockTypeAvailable: function(t) {
    return !_.isUndefined(this.blockTypes[t]);
  },
  
  _formatterAvailable: function(f) {
    return !_.isUndefined(this.formatters[f]);
  },
  
  _ensureAndSetElements: function() {
    
    this.$el = this.options.el;
    this.el = this.options.el[0];
    this.$form = this.$el.parents('form');
    
    // Wrap our element in lots of containers *eww*
    this.$el
      .wrap(
        $('<div>', { 
          'class': this.options.baseCSSClass + "_outer"
        })
      )
      .wrap(
        $('<div>', { 
          'class': this.options.baseCSSClass + "_dragleave"
        })
      )
      .wrap(
        $('<div>', {
          id: this.ID,
          'class': this.options.baseCSSClass + "_container",
          dropzone: 'copy link move'
        })
      );
      
    this.$wrapper = this.$form.find('#' + this.ID); 
  },
  
  _setBlocksAndFormatters: function() {
    this.blockTypes = flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.BlockTypes : this.options.blockTypes);
    this.formatters = flattern((_.isUndefined(this.options.formatters)) ? SirTrevor.Formatters : this.options.formatters);
  },
  
  _bindFunctions: function(){
    _.bindAll(this, this.bound);
  }
  
});
