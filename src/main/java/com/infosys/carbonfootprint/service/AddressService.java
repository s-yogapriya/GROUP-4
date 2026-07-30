package com.infosys.carbonfootprint.service;

import com.infosys.carbonfootprint.entity.Address;

import java.util.List;

public interface AddressService {

    Address saveAddress(Address address);

    List<Address> getAllAddresses();

    Address getAddressById(Long id);

    Address updateAddress(Long id, Address address);

    void deleteAddress(Long id);
}