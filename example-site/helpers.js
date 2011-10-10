var helpers = {

  allcaps: function() {
    return function(text, render) {
      return render(text).toUpperCase();
    };
  },

  shortened_text: function() {
    return this.text.split(" ").slice(0,10).join(" ") + "...";
  }

};