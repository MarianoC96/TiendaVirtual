import React, { createContext, useState, useContext } from 'react';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminContextDefinition = AdminContext; // Exporting for Provider use if needed separate
