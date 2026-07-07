import React from 'react';
import classNames from 'classnames';

import getCountryCodes from '../../../translations/countryCodes';
import { FormattedMessage } from '../../../util/reactIntl';
import {
  TX_TRANSITION_ACTOR_CUSTOMER as CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER as PROVIDER,
} from '../../../transactions/transaction';
import { Heading } from '../../../components';

import AddressLinkMaybe from './AddressLinkMaybe';

import css from './TransactionPanel.module.css';

// Pick the latest shipment detail entry submitted for the given role.
const latestShipmentDetailByRole = (shipmentDetails, role) => {
  const entriesForRole = (shipmentDetails || []).filter(entry => entry?.role === role);
  return entriesForRole[entriesForRole.length - 1];
};

// Show a shipping carrier / tracking number field pair, if present.
const ShipmentDetailFields = ({ shipmentDetail }) => (
  <div className={css.shipmentInfoContent}>
    {shipmentDetail.shippingCarrier ? (
      <div className={css.shipmentField}>
        <span className={css.shipmentFieldLabel}>
          <FormattedMessage id="TransactionPanel.shippingCarrierLabel" />
        </span>
        <span>{shipmentDetail.shippingCarrier}</span>
      </div>
    ) : null}
    {shipmentDetail.trackingNumber ? (
      <div className={css.shipmentField}>
        <span className={css.shipmentFieldLabel}>
          <FormattedMessage id="TransactionPanel.trackingNumberLabel" />
        </span>
        <span>{shipmentDetail.trackingNumber}</span>
      </div>
    ) : null}
  </div>
);

// Functional component as a helper to build ActivityFeed section
const DeliveryInfoMaybe = props => {
  const { className, rootClassName, protectedData, listing, locale } = props;
  const classes = classNames(rootClassName || css.deliveryInfoContainer, className);
  const deliveryMethod = protectedData?.deliveryMethod;
  const isShipping = deliveryMethod === 'shipping';
  const isPickup = deliveryMethod === 'pickup';

  if (isPickup) {
    const pickupLocation = listing?.attributes?.publicData?.location || {};
    return (
      <div className={classes}>
        <Heading as="h3" rootClassName={css.sectionHeading}>
          <FormattedMessage id="TransactionPanel.pickupInfoHeading" />
        </Heading>
        <div className={css.pickupInfoContent}>
          <AddressLinkMaybe
            linkRootClassName={css.pickupAddress}
            location={pickupLocation}
            geolocation={listing?.attributes?.geolocation}
            showAddress={true}
          />
        </div>
      </div>
    );
  } else if (isShipping) {
    const { name, phoneNumber, address } = protectedData?.shippingDetails || {};
    const { line1, line2, city, postalCode, state, country: countryCode } = address || {};
    const phoneMaybe = !!phoneNumber ? (
      <>
        {phoneNumber}
        <br />
      </>
    ) : null;

    const countryCodes = getCountryCodes(locale);
    const countryInfo = countryCodes.find(c => c.code === countryCode);
    const country = countryInfo?.name;

    const shipmentDetails = protectedData?.shipmentDetails;
    const providerShipment = latestShipmentDetailByRole(shipmentDetails, PROVIDER);
    const customerShipment = latestShipmentDetailByRole(shipmentDetails, CUSTOMER);

    return (
      <div className={classes}>
        <Heading as="h3" rootClassName={css.sectionHeading}>
          <FormattedMessage id="TransactionPanel.shippingInfoHeading" />
        </Heading>
        <div className={css.shippingInfoContent}>
          {name}
          <br />
          {phoneMaybe}
          {line1}
          {line2 ? `, ${line2}` : ''}
          <br />
          {postalCode}, {city}
          <br />
          {state ? `${state}, ` : ''}
          {country}
          <br />
        </div>
        {providerShipment ? (
          <div className={css.shipmentInfoSection}>
            <Heading as="h3" rootClassName={css.sectionHeading}>
              <FormattedMessage id="TransactionPanel.shipmentDetailsHeading" />
            </Heading>
            <ShipmentDetailFields shipmentDetail={providerShipment} />
          </div>
        ) : null}
        {customerShipment ? (
          <div className={css.shipmentInfoSection}>
            <Heading as="h3" rootClassName={css.sectionHeading}>
              <FormattedMessage id="TransactionPanel.returnShipmentDetailsHeading" />
            </Heading>
            <ShipmentDetailFields shipmentDetail={customerShipment} />
          </div>
        ) : null}
      </div>
    );
  }
  return null;
};

export default DeliveryInfoMaybe;
