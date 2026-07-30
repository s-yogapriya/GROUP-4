package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.entity.Address;
import com.infosys.carbonfootprint.exception.ResourceNotFoundException;
import com.infosys.carbonfootprint.repository.AddressRepository;
import com.infosys.carbonfootprint.repository.UserRepository;
import com.infosys.carbonfootprint.service.AddressService;
import org.springframework.stereotype.Service;
import com.infosys.carbonfootprint.entity.User;
import com.infosys.carbonfootprint.repository.UserRepository;

import java.util.List;

@Service
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressServiceImpl(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Address saveAddress(Address address) {

        Long userId = address.getUser().getUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        address.setUser(user);

        return addressRepository.save(address);
    }

    @Override
    public List<Address> getAllAddresses() {
        return addressRepository.findAll();
    }

    @Override
    public Address getAddressById(Long id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id " + id));
    }

    @Override
    public Address updateAddress(Long id, Address address) {

        Address existing = getAddressById(id);

        existing.setHouseNumber(address.getHouseNumber());
        existing.setStreet(address.getStreet());
        existing.setArea(address.getArea());
        existing.setLandmark(address.getLandmark());
        existing.setCity(address.getCity());
        existing.setState(address.getState());
        existing.setCountry(address.getCountry());
        existing.setPinCode(address.getPinCode());
        existing.setUser(address.getUser());

        return addressRepository.save(existing);
    }

    @Override
    public void deleteAddress(Long id) {

        Address address = getAddressById(id);

        addressRepository.delete(address);
    }
}