/* global $ */
import React from 'react';
import { Page, Section, SignupModal } from 'neal-react';
import Universe from '../components/Universe';
import { ContentProvider } from '../components/ContentProvider';
import GoogleAnalytics, { trackProductEvent, trackSubmitSuccess, trackSubmitFailure, trackSubmitEvent, trackOpenRequestModal } from '../components/GoogleAnalytics';
import HeroVideo from '../components/HeroVideo';
import HeroVideoContent from '../components/HeroVideoContent';
import CustomerFeedbackSection from '../components/CustomerFeedbackSection';
import { Footer } from '../components/Footer';
import PleaseWaitModal from '../components/PleaseWaitModal';
import ErrorModal from '../components/ErrorModal';
import ProductInfoModal from '../components/ProductInfoModal';
import NavigationHeader from '../components/NavigationHeader';
import WhereWeAre from '../components/WhereWeAre';
import WhoWeAre from '../components/WhoWeAre';
import WhatWeDo from '../components/WhatWeDo';
import WhyChooseUs from '../components/WhyChooseUs';
import HowWeWork from '../components/HowWeWork';
import HeroFooter from '../components/HeroFooter';

const heroVideo = {
  poster: '/resources/images/first-frame-hero.jpg',
  source: {
    url: '/resources/videos/shutterstock_v17053459.m4v',
    type: 'video/mp4'
  }
};

export default class Homepage extends React.Component {

  constructor(props) {
    super(props); 
    this.state = {
      business: ContentProvider.get('business') || {},
      homepage: ContentProvider.get('homepage') || {},
      pleaseWaitModal: ContentProvider.get('pleaseWaitModal') || {},
      defaultErrorModal: ContentProvider.get('defaultErrorModal') || {}
    };
  }

  renderRequestModal() {

    const modalId = 'request-appointment-modal';
    const messageServiceUrl = process.env.MESSAGE_SERVICE;
    const content = this.state.homepage.requestAppointmentModal || {};

    function onSendRequest() {
      Promise
        .resolve()
        .then(emitSubmitEvent)
        .then(hide.bind(null, 'request-appointment-modal'))
        .then(show.bind(null, 'please-wait-modal'))
        .then(sendFormDataToMessageService)
        .then(hide.bind(null, 'please-wait-modal'))
        .then(happyPath)
        .catch(sadPath);
    }

    function emitSubmitEvent() {
      $(document).trigger('request/submit');
    }

    function hide(modalId) {
      const $modal = $(`#${modalId}`);
      return new Promise(resolve => {
        $modal.one('hidden.bs.modal', () => {
          resolve();
        });
        $modal.modal('hide');
      });
    }

    function show(modalId) {
      const $modal = $(`#${modalId}`);
      return new Promise(resolve => {
        $modal.one('shown.bs.modal', () => {
          resolve();
        });
        $modal.modal('show');
      });      
    }

    function sendFormDataToMessageService() {
      const $form = $(`#${modalId} form`);
      const json = JSON.stringify(serializeFormData($form));
      return new Promise((resolve, reject) => {
        $.ajax({
          method: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: json,
          url: messageServiceUrl,
          success: resolve,
          error: reject
        });
      });
    }

    function serializeFormData($form) {
      if (!$form) throw 'Invalid input!';
      return $form.serializeArray().reduce((m, o) => { 
        m[o.name] = o.value; 
        return m;
      }, {});
    }

    function happyPath() {
      $(document).trigger('request/submit/happy-path');
      return show('request-confirmation-modal');
    }

    function sadPath() {
      $(document).trigger('request/submit/sad-path');
      return hide('please-wait-modal')
        .then(show.bind(null, 'error-modal'));
    }

    return (
      <SignupModal title={content.title} buttonText={content.buttonLabel} modalId={modalId} onSubmit={onSendRequest}>
        <div>
          <p>
            {content.description}
          </p>
        </div>
        <div>
          <SignupModal.Input name="name" required label={content.name} placeholder={content.name} />
          <SignupModal.Input name="age" required label="Age" placeholder={content.age} />
          <SignupModal.Input type="email" required name="email" label={content.email} placeholder={content.email} />
        </div>
      </SignupModal>
    );
  }

  renderRequestConfirmationModal() {
    let content;

    if (!this.state.homepage.requestAppointmentModal) {
      content = {};
    } else {
      content = this.state.homepage.requestAppointmentModal.confirmationModal || {};
    }
    const modalId = 'request-confirmation-modal';

    function hideModal() {
      $(`#${modalId}`).modal('hide');
    }

    return (
      <SignupModal title={content.title} buttonText={ content.buttonLabel } modalId={ modalId } onSubmit={hideModal}>
        <div>
          <p>{ content.text }</p>
        </div>
      </SignupModal>      
    );
  }

  renderPleaseWaitModal() {
    const content = this.state.pleaseWaitModal || {};
    return (
      <PleaseWaitModal title={content.text} modalId="please-wait-modal" />   
    );
  }

  renderErrorModal() {
    const content = this.state.defaultErrorModal || {};
    return (
      <ErrorModal title={content.title} text={content.text} buttonText={content.buttonText} modalId="error-modal" />
    );
  }

  renderProductInfoModal() {
    return (
      <ProductInfoModal modalId="product-info-modal" />
    );
  }

  render() {
    return (
      <Universe>
        <Page>
          
          <GoogleAnalytics account="UA-103461022-2" />
          <NavigationHeader contentProvider={ContentProvider} title={this.state.business.title} />

          <HeroVideo {... heroVideo}>
            <HeroVideoContent contentProvider={ContentProvider} />
          </HeroVideo>

          <Section className="gray-bg">
            <WhatWeDo contentProvider={ContentProvider} />
            <WhoWeAre contentProvider={ContentProvider} />
          </Section>

          <Section className="transparent-bg">
            <WhyChooseUs contentProvider={ContentProvider} />
          </Section>

          <Section className="gray-bg">
            <HowWeWork contentProvider={ContentProvider} />
          </Section>

          <WhereWeAre />

          <Section className="gold-gradient-bg thinner">
            <HeroFooter contentProvider={ContentProvider} />
          </Section>

          { this.renderRequestModal() }
          { this.renderRequestConfirmationModal() }
          { this.renderPleaseWaitModal() }
          { this.renderErrorModal() }
          { this.renderProductInfoModal() }

          <Footer brandName={this.state.business.title}
            facebookUrl={this.state.business.facebookUrl}
            twitterUrl={this.state.business.twitterUrl}
            skype={this.state.business.skype}
            whatsup={this.state.business.whatsup}
            email={this.state.business.emailAddress}
            phone1={this.state.business.phoneNumber}
            phone2={this.state.business.phoneNumberOptional}
            address={this.state.business.address} />

        </Page>
      </Universe>
    );
  }

}

