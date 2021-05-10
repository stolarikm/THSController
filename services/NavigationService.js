import React from "react";

export const navigationRef = React.createRef();

/**
 * Helper service for handling the references to navigation
 * Can be used from components without the need of passing
 * navigation as a component prop
 */
export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}
