import settings from '../settings.js';
import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom = {};

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector('select.widgets.datePicker.input');

    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector('select.widgets.datePicker.output');

    thisWidget.dom.input.value = thisWidget.value;

    thisWidget.initPlugin();
  }
  initPlugin() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
  }

  parseValue(value) {
    return utils.numberToHour(value);
  }
  isValid() {
    return true;
  }
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.output = thisWidget.value;
  }
}
export default HourPicker;
