// Imports
import '../scss/main.scss';
import planData from '../assets/json/plan.json';
import addOnData from '../assets/json/add-on.json';

// Custom Prototype Methods
String.prototype.toCapitalized = function () {
  return this.split(' ')
    .map(word => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ');
};

// Classes
class Formulary {
  static #data = {
    billing: {
      option: 'monthly',
      optionAbbreviated: 'mo',
    },
  };

  static get data() {
    return this.#data;
  }

  static set data(property) {
    this.#data = { ...property };
  }

  static init() {
    this.data = {
      billing: {
        option: 'monthly',
        optionAbbreviated: 'mo',
      },
    };
  }

  static changeStep(nextStep) {
    const currentStep = form.dataset.formStep;
    const currentStepContainer = document.querySelector(`[data-step="${currentStep}"]`);
    const nextStepContainer = document.querySelector(`[data-step="${nextStep}"]`);

    if (nextStep > currentStep) {
      this.#setCurrentStepTransition(currentStepContainer, 'scale-down');
      this.#setNextStepTransition(nextStepContainer, 'slide-in');
    } else {
      this.#setCurrentStepTransition(currentStepContainer, 'slide-out');
      this.#setNextStepTransition(nextStepContainer, 'scale-up');
    }

    const currentStepHeight = currentStepContainer.offsetHeight;
    const nextStepHeight = nextStepContainer.offsetHeight;
    const highestHeight = currentStepHeight > nextStepHeight ? currentStepHeight : nextStepHeight;

    this.#setStepsContainerHeight(highestHeight);
    form.setAttribute('data-form-step', nextStep);
    this.#changeActiveSidebarItem(currentStep, nextStep);
    this.#changeVisibleControl(nextStep);
  }

  static #setStepsContainerHeight(height) {
    const stepsContainer = document.querySelector('[data-js="form-steps"]');

    if (height == null) {
      height = 'auto';
    } else {
      const { paddingTop, paddingBottom } = getComputedStyle(stepsContainer);
      height = `calc(${height}px + ${paddingTop} + ${paddingBottom})`;
    }

    stepsContainer.style.setProperty('--steps-height', height);
  }

  static #setCurrentStepTransition(currentStepContainer, transitionName) {
    currentStepContainer.classList.add(transitionName);

    currentStepContainer.addEventListener(
      'animationend',
      () => {
        currentStepContainer.classList.add('hidden');
        currentStepContainer.classList.remove(transitionName);
        this.#setStepsContainerHeight();
      },
      { once: true }
    );
  }

  static #setNextStepTransition(nextStepContainer, transitionName) {
    nextStepContainer.classList.remove('hidden');
    nextStepContainer.classList.add(transitionName);

    nextStepContainer.addEventListener(
      'animationend',
      () => {
        nextStepContainer.classList.remove(transitionName);
      },
      { once: true }
    );
  }

  static #changeActiveSidebarItem(currentStep, nextStep) {
    if (nextStep == 5) return;

    const sidebarItems = document.querySelectorAll('[data-js="sidebar-item"]');
    const currentItem = sidebarItems[currentStep - 1];
    const nextItem = sidebarItems[nextStep - 1];

    currentItem.classList.remove('active');
    nextItem.classList.add('active');
  }

  static #changeVisibleControl(nextStep) {
    if (nextStep == 5) {
      formControl.classList.add('hidden');
      return;
    }

    const buttonNext = document.querySelector('[data-js="button-next"]');
    const buttonConfirm = document.querySelector('[data-js="button-confirm"]');
    const buttonBack = document.querySelector('[data-js="button-back"]');
    const isHidden = buttonNext.classList.contains('hidden');

    if (nextStep != 4 && isHidden) {
      buttonConfirm.classList.add('hidden');
      buttonNext.classList.remove('hidden');
      return;
    }

    if (nextStep == 4) {
      buttonNext.classList.add('hidden');
      buttonConfirm.classList.remove('hidden');
      return;
    }

    if (nextStep == 2) {
      buttonBack.classList.remove('hidden');
      return;
    }

    if (nextStep == 1) {
      buttonBack.classList.add('hidden');
      return;
    }
  }
}

class Personal {
  static #inputs = this.#getInputs();
  static #errorMessage = this.#getErrorMessage();

  static #getInputs() {
    return [
      {
        input: document.querySelector('[data-js="input-name"]'),
        regex: /^([\p{L}]+[,.'-]?)+(\s([\p{L}]+[,.'-]?)+)*$/u,
      },
      {
        input: document.querySelector('[data-js="input-email"]'),
        regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      },
      {
        input: document.querySelector('[data-js="input-phone"]'),
        regex: /^\+?1([\.\s-]?\d{3}){2}[\.\s-]?\d{3,4}$/,
      },
    ];
  }

  static #getErrorMessage() {
    return {
      required: 'This field is required',
      name: 'Enter a valid name',
      email: 'Enter a valid email',
      phone: 'Enter a valid US phone',
    };
  }

  static validate() {
    let isValid = true;

    this.#inputs.forEach(({ input, regex }) => {
      isValid = this.#isValueValid(input, regex) ? isValid : false;
    });

    if (isValid) {
      this.#inputs.forEach(({ input }) => {
        Formulary.data[input.id] = input.value;
      });
    }

    return isValid;
  }

  static #isValueValid(input, regex) {
    const { value } = input;

    if (!value.length) {
      this.#toggleErrorText(input, false, 'required');
      return false;
    }

    const isValid = regex.test(value);

    this.#toggleErrorText(input, isValid, input.name);
    return isValid;
  }

  static #toggleErrorText(input, isValid, errorName) {
    const field = input.closest('[data-js="field"]');
    const labelContainer = field.querySelector('[data-js="label-container"]');
    const textError = labelContainer.querySelector('[data-js="text-error"]');
    const message = this.#errorMessage[errorName];

    if (!isValid && textError) {
      textError.textContent = message;
      return;
    }

    if (isValid && textError) {
      input.classList.remove('error');
      labelContainer.removeChild(textError);
      return;
    }

    if (!isValid && !textError) {
      const template = document.querySelector('[data-template="text-error"]');
      const textErrorClone = template.content.firstElementChild.cloneNode(true);

      textErrorClone.textContent = message;
      input.classList.add('error');
      labelContainer.appendChild(textErrorClone);
    }
  }
}

class Plan {
  static #plan = planData;

  static validate() {
    const selectedInput = document.querySelector('[data-js="input-plan"]:checked');
    const planContainer = selectedInput.closest('[data-js="plan-container"]');
    const { planId } = planContainer.dataset;
    const { price, name } = this.#plan[planId];
    const { checked } = inputPlanOption;

    Formulary.data.plan = {
      name,
      price: checked ? price.yearly : price.monthly,
    };
  }

  static changePrice() {
    const planContainers = document.querySelectorAll('[data-js="plan-container"]');
    const template = document.querySelector('[data-template="yearly-gift"]');

    planContainers.forEach(container => {
      const planContent = container.querySelector('[data-js="plan-content"]');
      const planPrice = container.querySelector('[data-js="plan-price"]');
      const { planId } = container.dataset;
      const { price } = this.#plan[planId];
      const { option, optionAbbreviated } = Formulary.data.billing;

      planPrice.textContent = `$${price[option]}/${optionAbbreviated}`;

      if (option === 'yearly') {
        const textGiftClone = template.content.firstElementChild.cloneNode(true);
        planContent.appendChild(textGiftClone);
      } else {
        const textGift = planContent.querySelector('[data-js="text-gift"]');
        planContent.removeChild(textGift);
      }
    });
  }
}

class AddOn {
  static #addOn = addOnData;

  static validate() {
    const selectedAddOnInputs = document.querySelectorAll('[data-js="input-add-on"]:checked');
    const { option } = Formulary.data.billing;

    Formulary.data.addOns = [];
    selectedAddOnInputs.forEach(input => {
      const addOnContainer = input.closest('[data-js="add-on-container"]');
      const { addOnId } = addOnContainer.dataset;
      const { price, name } = this.#addOn[addOnId];

      Formulary.data.addOns.push({
        name,
        price: price[option],
      });
    });
  }

  static changePrice() {
    const addOnContainers = document.querySelectorAll('[data-js="add-on-container"]');
    const { option, optionAbbreviated } = Formulary.data.billing;

    addOnContainers.forEach(container => {
      const addOnPrice = container.querySelector('[data-js="add-on-price"]');
      const { addOnId } = container.dataset;
      const { price } = this.#addOn[addOnId];

      addOnPrice.textContent = `+$${price[option]}/${optionAbbreviated}`;
    });
  }
}

class Summary {
  static #summary = document.querySelector('[data-js="summary"]');
  static #totalPrice = 0;

  static configure() {
    const { plan, addOns, billing } = Formulary.data;
    const { option, optionAbbreviated } = billing;

    this.#totalPrice = 0;
    this.#configurePlan(plan, option, optionAbbreviated);
    this.#configureAddOns(addOns, optionAbbreviated);
    this.#configureTotal(option, optionAbbreviated);
  }

  static #configurePlan({ name, price }, option, optionAbbreviated) {
    const plan = this.#summary.querySelector('[data-js="summary-plan"]');
    const planPrice = this.#summary.querySelector('[data-js="summary-plan-price"]');

    this.#updateTotalPrice(price);
    plan.textContent = `${name.toCapitalized()} (${option.toCapitalized()})`;
    planPrice.textContent = `$${price}/${optionAbbreviated}`;
  }

  static #configureAddOns(addOns, optionAbbreviated) {
    const addOnsContainer = this.#summary.querySelector('[data-js="summary-add-ons"]');
    const addOnTemplate = document.querySelector('[data-template="summary-add-on"]');
    const addOnsFragment = document.createDocumentFragment();

    addOns.forEach(({ name, price }) => {
      const addOnClone = addOnTemplate.content.firstElementChild.cloneNode(true);
      const addOnName = addOnClone.querySelector('[data-js="add-on-name"]');
      const addOnPrice = addOnClone.querySelector('[data-js="add-on-price"]');

      this.#updateTotalPrice(price);
      addOnName.textContent = name;
      addOnPrice.textContent = `+$${price}/${optionAbbreviated}`;
      addOnsFragment.appendChild(addOnClone);
    });

    addOnsContainer.innerHTML = '';
    addOnsContainer.appendChild(addOnsFragment);
  }

  static #configureTotal(option, optionAbbreviated) {
    const total = this.#summary.querySelector('[data-js="summary-total"]');
    const totalPrice = this.#summary.querySelector('[data-js="summary-total-price"]');

    Formulary.data.billing.amount = this.#totalPrice;
    total.textContent = `Total (per ${option.slice(0, option.length - 2)})`;
    totalPrice.textContent = `+${this.#totalPrice}/${optionAbbreviated}`;
  }

  static #updateTotalPrice(price) {
    this.#totalPrice += price;
  }
}

// Global Variables
const form = document.querySelector('[data-js="form"]');
const formControl = document.querySelector('[data-js="form-control"]');
const inputPlanOption = document.querySelector('[data-js="input-option"]');
const buttonChangePlan = document.querySelector('[data-js="button-change"]');

// Event Listeners
form.addEventListener('submit', handleFormSubmit);
formControl.addEventListener('click', handleFormControlClick);
inputPlanOption.addEventListener('change', handlePlanOptionChange);
buttonChangePlan.addEventListener('click', () => Formulary.changeStep(2));

// IIFE
// (() => {
//   Formulary.init();
//   Plan.init();
//   AddOn.init();
// })();

// Event Handlers
function handleFormSubmit(event) {
  event.preventDefault();
}

function handleFormControlClick({ target }) {
  const currentStep = +form.dataset.formStep;

  if (target.matches('[data-js="button-back"]')) {
    Formulary.changeStep(currentStep - 1);
    return;
  }

  if (target.matches('[data-js="button-next"]')) {
    switch (currentStep) {
      case 1:
        if (!Personal.validate()) return;
        Formulary.changeStep(2);
        return;
      case 2:
        Plan.validate();
        Formulary.changeStep(3);
        return;
      case 3:
        AddOn.validate();
        Summary.configure();
        Formulary.changeStep(4);
        return;
    }
  }

  if (target.matches('[data-js="button-confirm"]')) {
    Formulary.changeStep(5);
    return;
  }
}

function handlePlanOptionChange() {
  const { checked } = inputPlanOption;
  const optionLabel = document.querySelector('[data-js="option-label"]');
  const monthlyLabel = document.querySelector('[data-js="option-monthly"]');
  const yearlyLabel = document.querySelector('[data-js="option-yearly"]');
  const labelledby = checked ? yearlyLabel.id : monthlyLabel.id;

  Formulary.data.billing = {
    option: checked ? 'yearly' : 'monthly',
    optionAbbreviated: checked ? 'yr' : 'mo',
  };

  monthlyLabel.classList.toggle('text--dark');
  yearlyLabel.classList.toggle('text--dark');
  optionLabel.setAttribute('aria-labelledby', labelledby);
  Plan.changePrice();
  AddOn.changePrice();
}
