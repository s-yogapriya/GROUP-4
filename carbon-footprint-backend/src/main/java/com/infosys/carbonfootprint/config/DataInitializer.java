package com.infosys.carbonfootprint.config;

import com.infosys.carbonfootprint.entity.*;
import com.infosys.carbonfootprint.repository.ActivityTypeRepository;
import com.infosys.carbonfootprint.repository.EmissionFactorRepository;
import com.infosys.carbonfootprint.repository.EmissionLimitRepository;
import com.infosys.carbonfootprint.repository.ArticleRepository;
import com.infosys.carbonfootprint.repository.GoalRepository;
import com.infosys.carbonfootprint.repository.ActivityLogRepository;
import com.infosys.carbonfootprint.repository.AlertRepository;
import com.infosys.carbonfootprint.repository.CategoryRepository;
import com.infosys.carbonfootprint.repository.RoleRepository;
import com.infosys.carbonfootprint.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Seeds default roles, admin account, categories, activity types,
 * emission factors and demonstration data.
 */
@Component
@Order(3)
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger =
            LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ActivityTypeRepository activityTypeRepository;

    @Autowired
    private EmissionFactorRepository emissionFactorRepository;

    @Autowired
    private EmissionLimitRepository emissionLimitRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@infosys.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        try {
            initializeData();
        } catch (Exception ex) {
            logger.error("Data initialization encountered an error: {}", ex.getMessage(), ex);
        }
    }

    private void initializeData() {
        logger.info(
                "Initializing database default roles and admin credentials..."
        );

        // =========================================================
        // 1. ROLE_ADMIN
        // =========================================================
        Role adminRole =
                roleRepository.findByName(
                        RoleType.ROLE_ADMIN
                ).orElseGet(
                        () -> roleRepository.save(
                                Role.builder()
                                        .name(
                                                RoleType.ROLE_ADMIN
                                        )
                                        .build()
                        )
                );

        // =========================================================
        // 2. ROLE_USER
        // =========================================================
        Role userRole =
                roleRepository.findByName(
                        RoleType.ROLE_USER
                ).orElseGet(
                        () -> roleRepository.save(
                                Role.builder()
                                        .name(
                                                RoleType.ROLE_USER
                                        )
                                        .build()
                        )
                );

        // =========================================================
        // 3. DEFAULT ADMIN
        // =========================================================
        User admin = userRepository.findByEmail(adminEmail)
                .or(() -> userRepository.findByUsername("admin"))
                .orElse(null);

        if (admin == null) {

            Address adminAddress =
                    Address.builder()
                            .houseNumber("100")
                            .street("Infosys Campus Road")
                            .area("Electronic City")
                            .landmark("Building 4")
                            .city("Bengaluru")
                            .state("Karnataka")
                            .country("India")
                            .pinCode("560100")
                            .build();

            GovernmentId adminGovId =
                    GovernmentId.builder()
                            .idType(IdType.PAN)
                            .idNumber("ADMIN1234F")
                            .build();

            Set<Role> roles =
                    new HashSet<>();

            roles.add(adminRole);
            roles.add(userRole);

            admin =
                    User.builder()
                            .username("admin")
                            .email(adminEmail)
                            .password(
                                    passwordEncoder.encode(
                                            adminPassword
                                    )
                                )
                            .firstName("System")
                            .lastName("Administrator")
                            .age(35)
                            .gender(Gender.MALE)
                            .dateOfBirth(
                                    LocalDate.of(
                                            1989,
                                            1,
                                            1
                                    )
                            )
                            .mobileNumber("9999999999")
                            .status(
                                    UserStatus.APPROVED
                            )
                            .firstLogin(false)
                            .address(adminAddress)
                            .governmentId(adminGovId)
                            .roles(roles)
                            .build();

            userRepository.save(admin);

            logger.info(
                    "================================================="
            );
            logger.info(
                    " Default Admin Account Created Successfully!"
            );
            logger.info(
                    " Email:    {}",
                    adminEmail
            );
            logger.info(
                    " Password: {}",
                    adminPassword
            );
            logger.info(
                    "================================================="
            );

        } else {
            boolean changed = false;
            if (admin.getRoles() == null) {
                admin.setRoles(new HashSet<>());
            }
            if (!admin.getRoles().contains(adminRole)) {
                admin.getRoles().add(adminRole);
                changed = true;
            }
            if (!admin.getRoles().contains(userRole)) {
                admin.getRoles().add(userRole);
                changed = true;
            }
            if (admin.getStatus() != UserStatus.APPROVED) {
                admin.setStatus(UserStatus.APPROVED);
                changed = true;
            }
            if (changed) {
                userRepository.save(admin);
            }
            logger.info(
                    "Admin account verified in database (Email: {}).",
                    admin.getEmail()
            );
        }

        // =========================================================
        // 4. CATEGORIES
        // =========================================================
        seedCategories();

        // =========================================================
        // 5. ACTIVITY TYPES
        // =========================================================
        seedActivityTypes();

        // =========================================================
        // 6. EMISSION FACTORS
        // =========================================================
        seedEmissionFactors();

        // =========================================================
        // 7. DEMO DATA
        // =========================================================
        seedDemoData();

        // =========================================================
        // 8. EXTENDED DASHBOARD DATASET
        // =========================================================
        seedExtendedDashboardDataset();
    }

    // =============================================================
    // CATEGORY SEEDING
    // =============================================================

    private void seedCategories() {
        List<Category> defaultCategories =
                List.of(
                        Category.builder()
                                .categoryCode("TRANS")
                                .categoryName("Transport")
                                .description(
                                        "Transport & Mobility activities including vehicle travel, public transit, and flights."
                                )
                                .icon("Car")
                                .colorCode("#3B82F6")
                                .displayOrder(1)
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .remarks(
                                        "Default system category for transport activities"
                                )
                                .createdBy("SYSTEM")
                                .build(),

                        Category.builder()
                                .categoryCode("ELEC")
                                .categoryName("Electricity")
                                .description(
                                        "Electricity and household energy consumption."
                                )
                                .icon("Zap")
                                .colorCode("#F59E0B")
                                .displayOrder(2)
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .remarks(
                                        "Default system category for electricity activities"
                                )
                                .createdBy("SYSTEM")
                                .build(),

                        Category.builder()
                                .categoryCode("FOOD")
                                .categoryName("Food")
                                .description(
                                        "Food & dietary footprint including meals and dietary choices."
                                )
                                .icon("Utensils")
                                .colorCode("#10B981")
                                .displayOrder(3)
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .remarks(
                                        "Default system category for food activities"
                                )
                                .createdBy("SYSTEM")
                                .build(),

                        Category.builder()
                                .categoryCode("SHOP")
                                .categoryName("Shopping")
                                .description(
                                        "Shopping, goods, and consumer product purchases."
                                )
                                .icon("ShoppingBag")
                                .colorCode("#EC4899")
                                .displayOrder(4)
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .remarks(
                                        "Default system category for shopping activities"
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

        for (Category cat : defaultCategories) {
            Category existing = categoryRepository.findByCategoryCode(cat.getCategoryCode())
                    .or(() -> categoryRepository.findByCategoryNameIgnoreCase(cat.getCategoryName()))
                    .orElse(null);
            if (existing == null) {
                categoryRepository.save(cat);
            }
        }

        logger.info(
                "Default categories verified."
        );
    }

    // =============================================================
    // ACTIVITY TYPE SEEDING
    // =============================================================

    private void seedActivityTypes() {
        List<ActivityType> activityTypes =
                new ArrayList<>();

            categoryRepository.findByCategoryCode(
                    "TRANS"
            ).ifPresent(cat -> {

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "TRANS_CAR"
                                )
                                .activityName(
                                        "Car"
                                )
                                .description(
                                        "Personal car travel"
                                )
                                .unit("km")
                                .minQuantity(0.1)
                                .maxQuantity(5000.0)
                                .defaultQuantity(10.0)
                                .displayOrder(1)
                                .icon("Car")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "TRANS_BUS"
                                )
                                .activityName(
                                        "Bus"
                                )
                                .description(
                                        "Public bus transit"
                                )
                                .unit("km")
                                .minQuantity(0.1)
                                .maxQuantity(2000.0)
                                .defaultQuantity(5.0)
                                .displayOrder(2)
                                .icon("Bus")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "TRANS_BIKE"
                                )
                                .activityName(
                                        "Bike"
                                )
                                .description(
                                        "Motorbike or scooter travel"
                                )
                                .unit("km")
                                .minQuantity(0.1)
                                .maxQuantity(1000.0)
                                .defaultQuantity(5.0)
                                .displayOrder(3)
                                .icon("Bike")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "TRANS_METRO"
                                )
                                .activityName(
                                        "Metro"
                                )
                                .description(
                                        "Subway / Metro train transit"
                                )
                                .unit("km")
                                .minQuantity(0.1)
                                .maxQuantity(1000.0)
                                .defaultQuantity(5.0)
                                .displayOrder(4)
                                .icon("Train")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "TRANS_FLIGHT"
                                )
                                .activityName(
                                        "Flight"
                                )
                                .description(
                                        "Air travel"
                                )
                                .unit("km")
                                .minQuantity(1.0)
                                .maxQuantity(50000.0)
                                .defaultQuantity(500.0)
                                .displayOrder(5)
                                .icon("Plane")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );
            });

            categoryRepository.findByCategoryCode(
                    "ELEC"
            ).ifPresent(cat -> {

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "ELEC_GRID"
                                )
                                .activityName(
                                        "Grid Electricity"
                                )
                                .description(
                                        "Grid electricity consumption"
                                )
                                .unit("kWh")
                                .minQuantity(0.1)
                                .maxQuantity(10000.0)
                                .defaultQuantity(10.0)
                                .displayOrder(1)
                                .icon("Zap")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "ELEC_SOLAR"
                                )
                                .activityName(
                                        "Solar Power"
                                )
                                .description(
                                        "Solar renewable energy usage"
                                )
                                .unit("kWh")
                                .minQuantity(0.1)
                                .maxQuantity(10000.0)
                                .defaultQuantity(10.0)
                                .displayOrder(2)
                                .icon("Sun")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "ELEC_GEN"
                                )
                                .activityName(
                                        "Generator (Diesel)"
                                )
                                .description(
                                        "Diesel power generator"
                                )
                                .unit("Liters")
                                .minQuantity(0.1)
                                .maxQuantity(1000.0)
                                .defaultQuantity(5.0)
                                .displayOrder(3)
                                .icon("Flame")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );
            });

            categoryRepository.findByCategoryCode(
                    "FOOD"
            ).ifPresent(cat -> {

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "FOOD_VEG"
                                )
                                .activityName(
                                        "Veg Meal"
                                )
                                .description(
                                        "Vegetarian meal"
                                )
                                .unit("meals")
                                .minQuantity(1.0)
                                .maxQuantity(20.0)
                                .defaultQuantity(1.0)
                                .displayOrder(1)
                                .icon("Utensils")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "FOOD_CHICKEN"
                                )
                                .activityName(
                                        "Chicken Meal"
                                )
                                .description(
                                        "Poultry / Chicken meal"
                                )
                                .unit("meals")
                                .minQuantity(1.0)
                                .maxQuantity(20.0)
                                .defaultQuantity(1.0)
                                .displayOrder(2)
                                .icon("Utensils")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "FOOD_BEEF"
                                )
                                .activityName(
                                        "Beef Meal"
                                )
                                .description(
                                        "Red meat / Beef meal"
                                )
                                .unit("meals")
                                .minQuantity(1.0)
                                .maxQuantity(20.0)
                                .defaultQuantity(1.0)
                                .displayOrder(3)
                                .icon("Utensils")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "FOOD_VEGAN"
                                )
                                .activityName(
                                        "Vegan Meal"
                                )
                                .description(
                                        "Plant-based vegan meal"
                                )
                                .unit("meals")
                                .minQuantity(1.0)
                                .maxQuantity(20.0)
                                .defaultQuantity(1.0)
                                .displayOrder(4)
                                .icon("Utensils")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );
            });

            categoryRepository.findByCategoryCode(
                    "SHOP"
            ).ifPresent(cat -> {

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "SHOP_ELEC"
                                )
                                .activityName(
                                        "Electronics"
                                )
                                .description(
                                        "Electronic gadgets & appliances"
                                )
                                .unit("items")
                                .minQuantity(1.0)
                                .maxQuantity(50.0)
                                .defaultQuantity(1.0)
                                .displayOrder(1)
                                .icon("ShoppingBag")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "SHOP_CLOTH"
                                )
                                .activityName(
                                        "Clothes"
                                )
                                .description(
                                        "Apparel & garments"
                                )
                                .unit("items")
                                .minQuantity(1.0)
                                .maxQuantity(100.0)
                                .defaultQuantity(1.0)
                                .displayOrder(2)
                                .icon("ShoppingBag")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

                activityTypes.add(
                        ActivityType.builder()
                                .category(cat)
                                .activityCode(
                                        "SHOP_FURN"
                                )
                                .activityName(
                                        "Furniture"
                                )
                                .description(
                                        "Home / office furniture"
                                )
                                .unit("items")
                                .minQuantity(1.0)
                                .maxQuantity(20.0)
                                .defaultQuantity(1.0)
                                .displayOrder(3)
                                .icon("Home")
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .createdBy("SYSTEM")
                                .build()
                );
            });

        for (ActivityType type : activityTypes) {
            if (activityTypeRepository.findByActivityCode(type.getActivityCode()).isEmpty()) {
                activityTypeRepository.save(type);
            }
        }

        logger.info(
                "Activity Types verified."
        );
    }

    // =============================================================
    // SOURCE MAPPING
    // =============================================================

    private String sourceForActivity(
            String activityCode
    ) {

        if (activityCode == null) {
            return "IPCC";
        }

        return switch (activityCode) {

            case "TRANS_CAR",
                 "TRANS_BIKE",
                 "TRANS_FLIGHT" ->
                    "EPA";

            case "TRANS_BUS",
                 "TRANS_METRO" ->
                    "IEA";

            case "ELEC_GRID" ->
                    "EPA";

            case "ELEC_SOLAR" ->
                    "IEA";

            case "ELEC_GEN" ->
                    "EPA";

            case "FOOD_VEG",
                 "FOOD_VEGAN" ->
                    "IPCC";

            case "FOOD_CHICKEN",
                 "FOOD_BEEF" ->
                    "IPCC";

            case "SHOP_ELEC" ->
                    "Ecoinvent";

            case "SHOP_CLOTH" ->
                    "Ecoinvent";

            case "SHOP_FURN" ->
                    "Ecoinvent";

            case "WATER_SHOWER",
                 "WATER_LAUNDRY",
                 "WATER_IRRIGATION" ->
                    "EPA";

            case "WASTE_GENERAL" ->
                    "EPA";

            case "WASTE_PLASTIC",
                 "WASTE_PAPER" ->
                    "DEFRA";

            case "AGRI_FERTILIZER",
                 "AGRI_LIVESTOCK" ->
                    "IPCC";

            case "AGRI_TRACTOR" ->
                    "EPA";

            case "BUILD_GAS" ->
                    "IEA";

            case "BUILD_AC" ->
                    "EPA";

            case "BUILD_LIGHTING" ->
                    "IEA";

            default ->
                    "IPCC";
        };
    }

    private String sourceVersionForActivity(
            String activityCode
    ) {

        String source =
                sourceForActivity(
                        activityCode
                );

        return switch (source) {

            case "IPCC" ->
                    "IPCC 2026";

            case "EPA" ->
                    "EPA 2026";

            case "DEFRA" ->
                    "DEFRA 2026";

            case "IEA" ->
                    "IEA 2026";

            case "Ecoinvent" ->
                    "Ecoinvent 2026";

            default ->
                    "2026";
        };
    }

    // =============================================================
    // EMISSION FACTORS
    // =============================================================

    private void seedEmissionFactors() {

        Map<String, Double> factors =
                Map.ofEntries(

                        Map.entry(
                                "TRANS_CAR",
                                0.21
                        ),
                        Map.entry(
                                "TRANS_BUS",
                                0.08
                        ),
                        Map.entry(
                                "TRANS_BIKE",
                                0.10
                        ),
                        Map.entry(
                                "TRANS_METRO",
                                0.05
                        ),
                        Map.entry(
                                "TRANS_FLIGHT",
                                0.25
                        ),

                        Map.entry(
                                "ELEC_GRID",
                                0.82
                        ),
                        Map.entry(
                                "ELEC_SOLAR",
                                0.05
                        ),
                        Map.entry(
                                "ELEC_GEN",
                                2.68
                        ),

                        Map.entry(
                                "FOOD_VEG",
                                0.70
                        ),
                        Map.entry(
                                "FOOD_CHICKEN",
                                2.50
                        ),
                        Map.entry(
                                "FOOD_BEEF",
                                6.60
                        ),
                        Map.entry(
                                "FOOD_VEGAN",
                                0.40
                        ),

                        Map.entry(
                                "SHOP_ELEC",
                                25.00
                        ),
                        Map.entry(
                                "SHOP_CLOTH",
                                8.00
                        ),
                        Map.entry(
                                "SHOP_FURN",
                                30.00
                        )
                );

        LocalDate today =
                LocalDate.now();

        for (ActivityType type :
                activityTypeRepository.findAll()) {

            Double factor =
                    factors.get(
                            type.getActivityCode()
                    );

            if (factor == null) {
                continue;
            }

            String source =
                    sourceForActivity(
                            type.getActivityCode()
                    );

            String sourceVersion =
                    sourceVersionForActivity(
                            type.getActivityCode()
                    );

            List<EmissionFactor> existing =
                    emissionFactorRepository
                            .findByActivityTypeActivityTypeIdOrderByEffectiveFromDesc(
                                    type.getActivityTypeId()
                            );

            if (existing.isEmpty()) {

                emissionFactorRepository.save(
                        EmissionFactor.builder()
                                .activityType(type)
                                .emissionFactor(factor)
                                .unit(type.getUnit())
                                .sourceName(source)
                                .sourceVersion(
                                        sourceVersion
                                )
                                .effectiveFrom(
                                        today.minusYears(1)
                                )
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .remarks(
                                        "Reference emission factor for EcoTrack."
                                )
                                .createdBy("SYSTEM")
                                .build()
                );

            } else {

                /*
                 * IMPORTANT:
                 * Existing records are updated too.
                 * This removes old labels such as:
                 *
                 * EcoTrack Demo Dataset
                 * EPA/IPCC
                 */
                EmissionFactor matching =
                        existing.stream()
                                .filter(
                                        e ->
                                                e.getStatus() == CategoryStatus.ACTIVE
                                )
                                .findFirst()
                                .orElse(existing.get(0));

                matching.setActivityType(type);
                matching.setEmissionFactor(factor);
                matching.setUnit(type.getUnit());
                matching.setSourceName(source);
                matching.setSourceVersion(
                        sourceVersion
                );
                matching.setStatus(
                        CategoryStatus.ACTIVE
                );
                matching.setRemarks(
                        "Reference emission factor for EcoTrack."
                );
                if (matching.getEffectiveFrom() == null) {
                    matching.setEffectiveFrom(
                            today.minusYears(1)
                    );
                }

                emissionFactorRepository.save(
                        matching
                );
            }
        }

        logger.info(
                "Emission factors verified and source names normalized."
        );
    }

    // =============================================================
    // ARTICLE IMAGE
    // =============================================================

    private String articleImageFor(
            String title,
            String category
    ) {

        String text =
                (
                        (title == null ? "" : title)
                        + " "
                        + (category == null ? "" : category)
                ).toLowerCase();

        if (
                text.contains("transport")
                        ||
                text.contains("cycling")
                        ||
                text.contains("car")
        ) {
            return "/article-images/transport-low-carbon.svg";
        }

        if (
                text.contains("energy")
                        ||
                text.contains("electricity")
                        ||
                text.contains("low-energy")
        ) {
            return "/article-images/home-energy.svg";
        }

        if (
                text.contains("food")
                        ||
                text.contains("meal")
        ) {
            return "/article-images/food-choices.svg";
        }

        if (
                text.contains("waste")
                        ||
                text.contains("recycling")
        ) {
            return "/article-images/food-waste.svg";
        }

        if (
                text.contains("shopping")
                        ||
                text.contains("product")
        ) {
            return "/article-images/sustainable-shopping.svg";
        }

        if (
                text.contains("dashboard")
                        ||
                text.contains("analytics")
        ) {
            return "/article-images/analytics-dashboard.svg";
        }

        if (
                text.contains("goal")
        ) {
            return "/article-images/carbon-goal.svg";
        }

        if (
                text.contains("water")
        ) {
            return "/article-images/water-saving.svg";
        }

        if (
                text.contains("agriculture")
                        ||
                text.contains("tractor")
        ) {
            return "/article-images/agriculture.svg";
        }

        if (
                text.contains("building")
                        ||
                text.contains("heating")
        ) {
            return "/article-images/buildings-heating.svg";
        }

        return "/article-images/small-changes.svg";
    }

    // =============================================================
    // DEMO DATA
    // =============================================================

    private void seedDemoData() {

        LocalDate today =
                LocalDate.now();

        Role userRole =
                roleRepository.findByName(
                        RoleType.ROLE_USER
                ).orElseThrow();

        String[][] users = {

                {
                        "demo.user",
                        "demo@ecotrack.local",
                        "Demo",
                        "User",
                        "9000000001"
                },

                {
                        "arun.kumar",
                        "arun.kumar@ecotrack.local",
                        "Arun",
                        "Kumar",
                        "9000000002"
                },

                {
                        "meena.sharma",
                        "meena.sharma@ecotrack.local",
                        "Meena",
                        "Sharma",
                        "9000000003"
                },

                {
                        "rahul.verma",
                        "rahul.verma@ecotrack.local",
                        "Rahul",
                        "Verma",
                        "9000000004"
                },

                {
                        "priya.rao",
                        "priya.rao@ecotrack.local",
                        "Priya",
                        "Rao",
                        "9000000005"
                },

                {
                        "karthik.s",
                        "karthik.s@ecotrack.local",
                        "Karthik",
                        "S",
                        "9000000006"
                },

                {
                        "divya.m",
                        "divya.m@ecotrack.local",
                        "Divya",
                        "M",
                        "9000000007"
                },

                {
                        "vignesh.r",
                        "vignesh.r@ecotrack.local",
                        "Vignesh",
                        "R",
                        "9000000008"
                },

                {
                        "ananya.p",
                        "ananya.p@ecotrack.local",
                        "Ananya",
                        "P",
                        "9000000009"
                },

                {
                        "sanjay.n",
                        "sanjay.n@ecotrack.local",
                        "Sanjay",
                        "N",
                        "9000000010"
                }
        };

        List<User> demoUsers =
                new ArrayList<>();

        for (int i = 0;
             i < users.length;
             i++) {

            final int idx = i;

            String[] u =
                    users[idx];

            User demo =
                    userRepository
                            .findByEmail(
                                    u[1]
                            )
                            .or(
                                    () ->
                                            userRepository
                                                    .findByUsername(
                                                            u[0]
                                                    )
                            )
                            .orElseGet(() -> {

                                Address address =
                                        Address.builder()
                                                .houseNumber(
                                                        String.valueOf(
                                                                10 + idx
                                                        )
                                                )
                                                .street(
                                                        "Green Street"
                                                )
                                                .area(
                                                        "Eco Nagar"
                                                )
                                                .landmark(
                                                        "Community Park"
                                                )
                                                .city(
                                                        "Chennai"
                                                )
                                                .state(
                                                        "Tamil Nadu"
                                                )
                                                .country(
                                                        "India"
                                                )
                                                .pinCode(
                                                        "600"
                                                                + String.format(
                                                                "%03d",
                                                                idx + 1
                                                        )
                                                )
                                                .build();

                                GovernmentId gov =
                                        GovernmentId.builder()
                                                .idType(
                                                        IdType.PAN
                                                )
                                                .idNumber(
                                                        "ECO"
                                                                + (
                                                                1000 + idx
                                                        )
                                                                + "X"
                                                )
                                                .build();

                                Set<Role> roles =
                                        new HashSet<>();

                                roles.add(
                                        userRole
                                );

                                return userRepository
                                        .save(
                                                User.builder()
                                                        .username(
                                                                u[0]
                                                        )
                                                        .email(
                                                                u[1]
                                                        )
                                                        .password(
                                                                passwordEncoder.encode(
                                                                        "demo123"
                                                                )
                                                        )
                                                        .firstName(
                                                                u[2]
                                                        )
                                                        .lastName(
                                                                u[3]
                                                        )
                                                        .age(
                                                                23
                                                                        + (
                                                                        idx
                                                                                % 8
                                                                )
                                                        )
                                                        .gender(
                                                                idx % 2 == 0
                                                                        ? Gender.FEMALE
                                                                        : Gender.MALE
                                                        )
                                                        .dateOfBirth(
                                                                LocalDate.of(
                                                                        1998
                                                                                + (
                                                                                idx
                                                                                        % 8
                                                                        ),
                                                                        2
                                                                                + (
                                                                                idx
                                                                                        % 10
                                                                        ),
                                                                        10
                                                                                + (
                                                                                idx
                                                                                        % 15
                                                                        )
                                                                )
                                                        )
                                                        .mobileNumber(
                                                                u[4]
                                                        )
                                                        .status(
                                                                UserStatus.APPROVED
                                                        )
                                                        .firstLogin(
                                                                false
                                                        )
                                                        .address(
                                                                address
                                                        )
                                                        .governmentId(
                                                                gov
                                                        )
                                                        .roles(
                                                                roles
                                                        )
                                                        .build()
                                        );
                            });

            demoUsers.add(
                    demo
            );
        }

        // =========================================================
        // ARTICLES
        // =========================================================

        String[][] articleData = {

                {
                        "Simple Ways to Reduce Transport Emissions",
                        "Practical daily choices that can lower your travel footprint.",
                        "Transport"
                },

                {
                        "Save Energy at Home",
                        "Small electricity-saving habits can make a measurable difference.",
                        "Energy"
                },

                {
                        "Food Choices and Carbon Footprint",
                        "Understand how meal choices affect your environmental impact.",
                        "Food"
                },

                {
                        "Why Public Transport Matters",
                        "How shared mobility can reduce emissions per passenger.",
                        "Transport"
                },

                {
                        "Build a Low-Energy Home Routine",
                        "Simple routines for monitoring and reducing household energy.",
                        "Energy"
                },

                {
                        "Reduce Food Waste",
                        "Planning meals and storing food well can reduce avoidable emissions.",
                        "Food"
                },

                {
                        "Sustainable Shopping Guide",
                        "Choose durable products and reduce unnecessary purchases.",
                        "Shopping"
                },

                {
                        "Cycling for Short Trips",
                        "A practical approach to replacing short car journeys.",
                        "Transport"
                },

                {
                        "Understanding Your Carbon Dashboard",
                        "Learn how to read trends, categories and monthly totals.",
                        "Analytics"
                },

                {
                        "Set a Realistic Monthly Carbon Goal",
                        "Use your historical footprint to choose an achievable target.",
                        "Goals"
                },

                {
                        "Small Changes, Large Impact",
                        "Combine several low-effort sustainable habits for lasting results.",
                        "Sustainability"
                },

                {
                        "Track Before You Reduce",
                        "Consistent activity logging makes reduction decisions measurable.",
                        "Awareness"
                }
        };

        for (
                int i = 0;
                i < articleData.length;
                i++
        ) {
            String[] a =
                    articleData[i];
            final String title = a[0];
            boolean exists =
                    articleRepository.findAll()
                            .stream()
                            .anyMatch(
                                    art ->
                                            art.getTitle() != null
                                            &&
                                            art.getTitle().equalsIgnoreCase(title)
                            );

            if (!exists) {
                articleRepository.save(
                        Article.builder()
                                .title(a[0])
                                .shortDescription(a[1])
                                .content(
                                        a[1]
                                                + " Explore practical steps, track your activities in EcoTrack, compare your monthly carbon footprint and use recommendations to build sustainable habits."
                                )
                                .category(a[2])
                                .coverImage(
                                        articleImageFor(
                                                a[0],
                                                a[2]
                                        )
                                )
                                .author(
                                        "EcoTrack Admin"
                                )
                                .status(
                                        ArticleStatus.PUBLISHED
                                )
                                .visibleToUsers(
                                        true
                                )
                                .publishedAt(
                                        LocalDateTime.now()
                                                .minusDays(
                                                        i + 1L
                                                )
                                )
                                .build()
                );
            }
        }

        List<Article> articlesWithoutImages =
                articleRepository.findAll()
                        .stream()
                        .filter(
                                a ->
                                        a.getCoverImage() == null
                                                ||
                                        a.getCoverImage().isBlank()
                        )
                        .toList();

        if (!articlesWithoutImages.isEmpty()) {

            articlesWithoutImages.forEach(
                    article ->
                            article.setCoverImage(
                                    articleImageFor(
                                            article.getTitle(),
                                            article.getCategory()
                                    )
                            )
            );

            articleRepository.saveAll(
                    articlesWithoutImages
            );
        }

        // =========================================================
        // EMISSION LIMITS
        // =========================================================

        String[] categoryCodes = {
                "TRANS",
                "ELEC",
                "FOOD",
                "SHOP"
        };

        double[] limits = {
                20.0,
                120.0,
                40.0,
                80.0
        };

        for (
                int i = 0;
                i < categoryCodes.length;
                i++
        ) {

            Category category =
                    categoryRepository
                            .findByCategoryCode(
                                    categoryCodes[i]
                            )
                            .orElse(null);

            if (category != null) {

                upsertEmissionLimit(
                        category,
                        limits[i]
                );
            }
        }

        // =========================================================
        // ACTIVITY LOGS
        // =========================================================

        String[] activityCodes = {

                "TRANS_CAR",
                "TRANS_BUS",
                "TRANS_BIKE",
                "TRANS_METRO",
                "TRANS_FLIGHT",

                "ELEC_GRID",
                "ELEC_SOLAR",

                "FOOD_VEG",
                "FOOD_CHICKEN",
                "FOOD_BEEF",

                "SHOP_ELEC",
                "SHOP_CLOTH"
        };

        for (
                int i = 0;
                i < 60;
                i++
        ) {

            User user =
                    demoUsers.get(
                            i % demoUsers.size()
                    );

            ActivityType type =
                    activityTypeRepository
                            .findByActivityCode(
                                    activityCodes[
                                            i % activityCodes.length
                                    ]
                            )
                            .orElse(null);

            if (type == null) {
                continue;
            }

            double quantity;

            if (
                    type.getUnit()
                            .equalsIgnoreCase("km")
            ) {

                quantity =
                        8
                                + (
                                i % 9
                        ) * 4;

            } else if (
                    type.getUnit()
                            .equalsIgnoreCase("kWh")
            ) {

                quantity =
                        10
                                + (
                                i % 8
                        ) * 5;

            } else if (
                    type.getUnit()
                            .equalsIgnoreCase("meals")
            ) {

                quantity =
                        1
                                + (
                                i % 3
                        );

            } else {

                quantity =
                        1
                                + (
                                i % 3
                        );
            }

            addDemoLog(
                    user,
                    type,
                    quantity,
                    today.minusDays(
                            i % 27
                    ),
                    "Seeded sustainability activity "
                            + (
                            i + 1
                    )
            );
        }

        // =========================================================
        // PRIMARY DEMO HISTORY
        // =========================================================

        User primaryDemo =
                demoUsers.get(0);

        for (
                int j = 0;
                j < 15;
                j++
        ) {

            ActivityType type =
                    activityTypeRepository
                            .findByActivityCode(
                                    activityCodes[
                                            (j + 3)
                                                    % activityCodes.length
                                    ]
                            )
                            .orElse(null);

            if (type == null) {
                continue;
            }

            double quantity;

            if (
                    type.getUnit()
                            .equalsIgnoreCase("km")
            ) {

                quantity =
                        12
                                + (
                                j % 5
                        ) * 5;

            } else if (
                    type.getUnit()
                            .equalsIgnoreCase("kWh")
            ) {

                quantity =
                        15
                                + (
                                j % 6
                        ) * 5;

            } else {

                quantity =
                        1
                                + (
                                j % 3
                        );
            }

            addDemoLog(
                    primaryDemo,
                    type,
                    quantity,
                    today.minusDays(
                            j * 11L
                    ),
                    "Demo history activity "
                            + (
                            j + 1
                    )
            );
        }

        // =========================================================
        // GOALS
        // =========================================================

        for (
                int i = 0;
                i < demoUsers.size();
                i++
        ) {

            User user =
                    demoUsers.get(i);

            int monthsToSeed =
                    i == 0 ? 12 : 2;

            for (
                    int m = 0;
                    m < monthsToSeed;
                    m++
            ) {

                LocalDate monthDate =
                        today.minusMonths(m);

                if (
                        goalRepository
                                .findByUserIdAndMonthAndYear(
                                        user.getId(),
                                        monthDate.getMonthValue(),
                                        monthDate.getYear()
                                )
                                .isEmpty()
                ) {

                    double target =
                            45.0
                                    + i * 5
                                    + m * 2;

                    goalRepository.save(
                            Goal.builder()
                                    .user(user)
                                    .targetAmount(
                                            target
                                    )
                                    .targetEmission(
                                            target
                                    )
                                    .status(
                                            "IN PROGRESS"
                                    )
                                    .month(
                                            monthDate.getMonthValue()
                                    )
                                    .year(
                                            monthDate.getYear()
                                    )
                                    .targetYear(
                                            monthDate.getYear()
                                    )
                                    .build()
                    );
                }
            }
        }

        // =========================================================
        // ALERTS
        // =========================================================

        for (
                int m = 0;
                m < 12;
                m++
        ) {

            LocalDate monthDate =
                    today.minusMonths(m);

            Category category =
                    categoryRepository
                            .findByCategoryCode(
                                    categoryCodes[
                                            m % categoryCodes.length
                                    ]
                            )
                            .orElse(null);

            if (category == null) {
                continue;
            }

            Double limit =
                    emissionLimitRepository
                            .findByCategoryCategoryIdAndActiveTrue(
                                    category.getCategoryId()
                            )
                            .map(
                                    EmissionLimit::getMonthlyLimit
                            )
                            .orElse(
                                    50.0
                            );

            if (
                    !alertRepository
                            .existsByUserIdAndCategoryCategoryIdAndAlertTypeAndMonthAndYear(
                                    primaryDemo.getId(),
                                    category.getCategoryId(),
                                    AlertType.HIGH_EMISSION,
                                    monthDate.getMonthValue(),
                                    monthDate.getYear()
                            )
            ) {

                double current =
                        limit
                                + 8
                                + m * 1.5;

                alertRepository.save(
                        Alert.builder()
                                .user(primaryDemo)
                                .category(category)
                                .alertType(
                                        AlertType.HIGH_EMISSION
                                )
                                .severity(
                                        AlertSeverity.HIGH
                                )
                                .title(
                                        "High "
                                                + category.getCategoryName()
                                                + " emissions"
                                )
                                .message(
                                        "Your "
                                                + category.getCategoryName().toLowerCase()
                                                + " emissions are high. Please consider lower-carbon alternatives."
                                )
                                .recommendation(
                                        "Review your recent "
                                                + category.getCategoryName().toLowerCase()
                                                + " activities and follow the recommendations."
                                )
                                .currentEmission(
                                        current
                                )
                                .monthlyLimit(
                                        limit
                                )
                                .thresholdValue(
                                        limit
                                )
                                .exceededAmount(
                                        current - limit
                                )
                                .month(
                                        monthDate.getMonthValue()
                                )
                                .year(
                                        monthDate.getYear()
                                )
                                .isRead(
                                        m % 3 == 0
                                )
                                .resolved(false)
                                .build()
                );
            }
        }

        int alertSeedIndex = 0;

        while (
                alertRepository.count() < 10
                        &&
                alertSeedIndex < 50
        ) {

            User user =
                    demoUsers.get(
                            (
                                    alertSeedIndex + 1
                            )
                                    % demoUsers.size()
                    );

            LocalDate monthDate =
                    today.minusMonths(
                            alertSeedIndex % 6
                    );

            Category category =
                    categoryRepository
                            .findByCategoryCode(
                                    categoryCodes[
                                            alertSeedIndex
                                                    % categoryCodes.length
                                    ]
                            )
                            .orElse(null);

            if (
                    category != null
                            &&
                    !alertRepository
                            .existsByUserIdAndCategoryCategoryIdAndAlertTypeAndMonthAndYear(
                                    user.getId(),
                                    category.getCategoryId(),
                                    AlertType.HIGH_EMISSION,
                                    monthDate.getMonthValue(),
                                    monthDate.getYear()
                            )
            ) {

                Double limit =
                        emissionLimitRepository
                                .findByCategoryCategoryIdAndActiveTrue(
                                        category.getCategoryId()
                                )
                                .map(
                                        EmissionLimit::getMonthlyLimit
                                )
                                .orElse(
                                        50.0
                                );

                double current =
                        limit
                                + 10
                                + alertSeedIndex;

                alertRepository.save(
                        Alert.builder()
                                .user(user)
                                .category(category)
                                .alertType(
                                        AlertType.HIGH_EMISSION
                                )
                                .severity(
                                        AlertSeverity.HIGH
                                )
                                .title(
                                        "High "
                                                + category.getCategoryName()
                                                + " emissions"
                                )
                                .message(
                                        "Your emissions are above the recommended monthly level."
                                )
                                .recommendation(
                                        "Choose lower-carbon alternatives where possible."
                                )
                                .currentEmission(
                                        current
                                )
                                .monthlyLimit(
                                        limit
                                )
                                .thresholdValue(
                                        limit
                                )
                                .exceededAmount(
                                        current - limit
                                )
                                .month(
                                        monthDate.getMonthValue()
                                )
                                .year(
                                        monthDate.getYear()
                                )
                                .isRead(false)
                                .resolved(false)
                                .build()
                );
            }

            alertSeedIndex++;
        }

        logger.info(
                "Demo data verification complete: {} users, {} categories, {} activity types, {} factors, {} logs, {} goals, {} alerts, {} articles.",
                userRepository.count(),
                categoryRepository.count(),
                activityTypeRepository.count(),
                emissionFactorRepository.count(),
                activityLogRepository.count(),
                goalRepository.count(),
                alertRepository.count(),
                articleRepository.count()
        );
    }

    // =============================================================
    // EXTENDED DASHBOARD DATASET
    // =============================================================

    private void seedExtendedDashboardDataset() {

        logger.info(
                "Verifying extended dashboard dataset..."
        );

        Map<String, CategorySeed> categorySeeds =
                new LinkedHashMap<>();

        categorySeeds.put(
                "WATER",
                new CategorySeed(
                        "Water & Conservation",
                        "Water use, conservation, showers and household water activities.",
                        "Droplets",
                        "#06B6D4",
                        5,
                        "/category-images/water.svg"
                )
        );

        categorySeeds.put(
                "WASTE",
                new CategorySeed(
                        "Waste Management",
                        "Household waste, recycling and material recovery activities.",
                        "Recycle",
                        "#84CC16",
                        6,
                        "/category-images/waste.svg"
                )
        );

        categorySeeds.put(
                "AGRI",
                new CategorySeed(
                        "Agriculture",
                        "Farming, fertilizer, livestock and agricultural fuel activities.",
                        "Wheat",
                        "#A3E635",
                        7,
                        "/category-images/agriculture.svg"
                )
        );

        categorySeeds.put(
                "BUILD",
                new CategorySeed(
                        "Buildings & Heating",
                        "Building energy, heating, cooling and lighting activities.",
                        "Building2",
                        "#F97316",
                        8,
                        "/category-images/buildings.svg"
                )
        );

        Map<String, Category> categories =
                new HashMap<>();

        for (
                Map.Entry<String, CategorySeed> e :
                categorySeeds.entrySet()
        ) {

            CategorySeed seed =
                    e.getValue();

            Category category =
                    categoryRepository
                            .findByCategoryCode(
                                    e.getKey()
                            )
                            .or(
                                    () ->
                                            categoryRepository
                                                    .findByCategoryNameIgnoreCase(
                                                            seed.name
                                                    )
                            )
                            .orElseGet(
                                    () ->
                                            categoryRepository
                                                    .save(
                                                            Category.builder()
                                                                    .categoryCode(
                                                                            e.getKey()
                                                                    )
                                                                    .categoryName(
                                                                            seed.name
                                                                    )
                                                                    .description(
                                                                            seed.description
                                                                    )
                                                                    .icon(
                                                                            seed.icon
                                                                    )
                                                                    .image(
                                                                            seed.image
                                                                    )
                                                                    .colorCode(
                                                                            seed.color
                                                                    )
                                                                    .displayOrder(
                                                                            seed.order
                                                                    )
                                                                    .status(
                                                                            CategoryStatus.ACTIVE
                                                                    )
                                                                    .remarks(
                                                                            "Extended dashboard category"
                                                                    )
                                                                    .createdBy(
                                                                            "SYSTEM"
                                                                    )
                                                                    .build()
                                                    )
                            );

            boolean changed =
                    false;

            if (
                    category.getImage() == null
                            ||
                    category.getImage().isBlank()
            ) {

                category.setImage(
                        seed.image
                );

                changed = true;
            }

            if (
                    category.getColorCode() == null
                            ||
                    category.getColorCode().isBlank()
            ) {

                category.setColorCode(
                        seed.color
                );

                changed = true;
            }

            if (
                    category.getDisplayOrder()
                            == null
            ) {

                category.setDisplayOrder(
                        seed.order
                );

                changed = true;
            }

            if (changed) {

                categoryRepository.save(
                        category
                );
            }

            categories.put(
                    e.getKey(),
                    category
            );
        }

        // =========================================================
        // EXTENDED ACTIVITY TYPES
        // =========================================================

        Map<String, ActivitySeed> activitySeeds =
                new LinkedHashMap<>();

        activitySeeds.put(
                "WATER_SHOWER",
                new ActivitySeed(
                        "WATER",
                        "Shower Water",
                        "Household shower water usage",
                        "Liters",
                        10,
                        500,
                        60,
                        "Droplets",
                        1
                )
        );

        activitySeeds.put(
                "WATER_LAUNDRY",
                new ActivitySeed(
                        "WATER",
                        "Laundry Water",
                        "Water used for one laundry cycle",
                        "Liters",
                        20,
                        300,
                        80,
                        "WashingMachine",
                        2
                )
        );

        activitySeeds.put(
                "WATER_IRRIGATION",
                new ActivitySeed(
                        "WATER",
                        "Garden Irrigation",
                        "Household garden irrigation water",
                        "Liters",
                        10,
                        1000,
                        100,
                        "Sprout",
                        3
                )
        );

        activitySeeds.put(
                "WASTE_GENERAL",
                new ActivitySeed(
                        "WASTE",
                        "General Waste",
                        "Mixed household waste sent for disposal",
                        "kg",
                        0.1,
                        100,
                        2,
                        "Trash2",
                        1
                )
        );

        activitySeeds.put(
                "WASTE_PLASTIC",
                new ActivitySeed(
                        "WASTE",
                        "Plastic Recycling",
                        "Plastic separated for recycling",
                        "kg",
                        0.1,
                        100,
                        1,
                        "Recycle",
                        2
                )
        );

        activitySeeds.put(
                "WASTE_PAPER",
                new ActivitySeed(
                        "WASTE",
                        "Paper Recycling",
                        "Paper and cardboard sent for recycling",
                        "kg",
                        0.1,
                        100,
                        1,
                        "FileText",
                        3
                )
        );

        activitySeeds.put(
                "AGRI_FERTILIZER",
                new ActivitySeed(
                        "AGRI",
                        "Fertilizer Use",
                        "Agricultural fertilizer application",
                        "kg",
                        0.1,
                        500,
                        5,
                        "Sprout",
                        1
                )
        );

        activitySeeds.put(
                "AGRI_TRACTOR",
                new ActivitySeed(
                        "AGRI",
                        "Tractor Fuel",
                        "Diesel used by agricultural machinery",
                        "Liters",
                        0.5,
                        500,
                        15,
                        "Tractor",
                        2
                )
        );

        activitySeeds.put(
                "AGRI_LIVESTOCK",
                new ActivitySeed(
                        "AGRI",
                        "Livestock Feed",
                        "Feed used for livestock production",
                        "kg",
                        0.1,
                        500,
                        10,
                        "Wheat",
                        3
                )
        );

        activitySeeds.put(
                "BUILD_GAS",
                new ActivitySeed(
                        "BUILD",
                        "Natural Gas Heating",
                        "Natural gas consumed for heating",
                        "kWh",
                        0.1,
                        5000,
                        20,
                        "Flame",
                        1
                )
        );

        activitySeeds.put(
                "BUILD_AC",
                new ActivitySeed(
                        "BUILD",
                        "Air Conditioner",
                        "Electricity used by air conditioning",
                        "kWh",
                        0.1,
                        5000,
                        10,
                        "Wind",
                        2
                )
        );

        activitySeeds.put(
                "BUILD_LIGHTING",
                new ActivitySeed(
                        "BUILD",
                        "Building Lighting",
                        "Electricity used for building lighting",
                        "kWh",
                        0.1,
                        3000,
                        8,
                        "Lightbulb",
                        3
                )
        );

        Map<String, ActivityType> activities =
                new HashMap<>();

        for (
                Map.Entry<String, ActivitySeed> e :
                activitySeeds.entrySet()
        ) {

            ActivitySeed seed =
                    e.getValue();

            ActivityType type =
                    activityTypeRepository
                            .findByActivityCode(
                                    e.getKey()
                            )
                            .orElseGet(
                                    () ->
                                            activityTypeRepository
                                                    .save(
                                                            ActivityType.builder()
                                                                    .category(
                                                                            categories.get(
                                                                                    seed.categoryCode
                                                                            )
                                                                    )
                                                                    .activityCode(
                                                                            e.getKey()
                                                                    )
                                                                    .activityName(
                                                                            seed.name
                                                                    )
                                                                    .description(
                                                                            seed.description
                                                                    )
                                                                    .unit(
                                                                            seed.unit
                                                                    )
                                                                    .minQuantity(
                                                                            seed.min
                                                                    )
                                                                    .maxQuantity(
                                                                            seed.max
                                                                    )
                                                                    .defaultQuantity(
                                                                            seed.def
                                                                    )
                                                                    .displayOrder(
                                                                            seed.order
                                                                    )
                                                                    .icon(
                                                                            seed.icon
                                                                    )
                                                                    .status(
                                                                            CategoryStatus.ACTIVE
                                                                    )
                                                                    .createdBy(
                                                                            "SYSTEM"
                                                                    )
                                                                    .build()
                                                    )
                            );

            activities.put(
                    e.getKey(),
                    type
            );
        }

        // =========================================================
        // EXTENDED FACTOR VALUES
        // =========================================================

        Map<String, Double> factorValues =
                Map.ofEntries(

                        Map.entry(
                                "WATER_SHOWER",
                                0.002
                        ),

                        Map.entry(
                                "WATER_LAUNDRY",
                                0.0015
                        ),

                        Map.entry(
                                "WATER_IRRIGATION",
                                0.001
                        ),

                        Map.entry(
                                "WASTE_GENERAL",
                                0.45
                        ),

                        Map.entry(
                                "WASTE_PLASTIC",
                                0.20
                        ),

                        Map.entry(
                                "WASTE_PAPER",
                                0.08
                        ),

                        Map.entry(
                                "AGRI_FERTILIZER",
                                1.80
                        ),

                        Map.entry(
                                "AGRI_TRACTOR",
                                2.68
                        ),

                        Map.entry(
                                "AGRI_LIVESTOCK",
                                0.90
                        ),

                        Map.entry(
                                "BUILD_GAS",
                                0.20
                        ),

                        Map.entry(
                                "BUILD_AC",
                                0.82
                        ),

                        Map.entry(
                                "BUILD_LIGHTING",
                                0.45
                        )
                );

        LocalDate today =
                LocalDate.now();

        // =========================================================
        // UPDATE / INSERT EXTENDED FACTORS
        // =========================================================

        for (
                Map.Entry<String, ActivityType> e :
                activities.entrySet()
        ) {

            String activityCode =
                    e.getKey();

            ActivityType type =
                    e.getValue();

            Double factor =
                    factorValues.get(
                            activityCode
                    );

            if (
                    factor == null ||
                    type == null
            ) {
                continue;
            }

            String source =
                    sourceForActivity(
                            activityCode
                    );

            String sourceVersion =
                    sourceVersionForActivity(
                            activityCode
                    );

            List<EmissionFactor> existing =
                    emissionFactorRepository
                            .findByActivityTypeActivityTypeIdOrderByEffectiveFromDesc(
                                    type.getActivityTypeId()
                            );

            if (existing.isEmpty()) {

                emissionFactorRepository.save(
                        EmissionFactor.builder()
                                .activityType(type)
                                .emissionFactor(
                                        factor
                                )
                                .unit(
                                        type.getUnit()
                                )
                                .sourceName(
                                        source
                                )
                                .sourceVersion(
                                        sourceVersion
                                )
                                .effectiveFrom(
                                        today.minusYears(1)
                                )
                                .status(
                                        CategoryStatus.ACTIVE
                                )
                                .remarks(
                                        "Reference emission factor for EcoTrack dashboard."
                                )
                                .createdBy(
                                        "SYSTEM"
                                )
                                .build()
                );

            } else {

                /*
                 * This is the important part.
                 *
                 * Existing rows with:
                 * EcoTrack Demo Dataset
                 *
                 * are updated to their proper
                 * IPCC / EPA / DEFRA / IEA / Ecoinvent source.
                 */
                EmissionFactor matching =
                        existing.stream()
                                .filter(
                                        f ->
                                                f.getStatus() == CategoryStatus.ACTIVE
                                )
                                .findFirst()
                                .orElse(existing.get(0));

                matching.setActivityType(
                        type
                );

                matching.setEmissionFactor(
                        factor
                );

                matching.setUnit(
                        type.getUnit()
                );

                matching.setSourceName(
                        source
                );

                matching.setSourceVersion(
                        sourceVersion
                );

                matching.setStatus(
                        CategoryStatus.ACTIVE
                );

                matching.setRemarks(
                        "Reference emission factor for EcoTrack dashboard."
                );
                if (matching.getEffectiveFrom() == null) {
                    matching.setEffectiveFrom(
                            today.minusYears(1)
                    );
                }

                emissionFactorRepository.save(
                        matching
                );
            }
        }

        // =========================================================
        // EXTENDED LIMITS
        // =========================================================

        Map<String, Double> limits =
                Map.of(
                        "WATER",
                        50.0,

                        "WASTE",
                        25.0,

                        "AGRI",
                        100.0,

                        "BUILD",
                        75.0
                );

        for (
                Map.Entry<String, Double> e :
                limits.entrySet()
        ) {

            Category category =
                    categories.get(
                            e.getKey()
                    );

            if (category != null) {

                upsertEmissionLimit(
                        category,
                        e.getValue()
                );
            }
        }

        // =========================================================
        // DISTINCT ARTICLE IMAGES
        // =========================================================

        Map<String, String> articleImages =
                new LinkedHashMap<>();

        articleImages.put(
                "Simple Ways to Reduce Transport Emissions",
                "/article-images/transport-low-carbon.svg"
        );

        articleImages.put(
                "Save Energy at Home",
                "/article-images/home-energy.svg"
        );

        articleImages.put(
                "Food Choices and Carbon Footprint",
                "/article-images/food-choices.svg"
        );

        articleImages.put(
                "Why Public Transport Matters",
                "/article-images/public-transport.svg"
        );

        articleImages.put(
                "Build a Low-Energy Home Routine",
                "/article-images/low-energy-home.svg"
        );

        articleImages.put(
                "Reduce Food Waste",
                "/article-images/food-waste.svg"
        );

        articleImages.put(
                "Sustainable Shopping Guide",
                "/article-images/sustainable-shopping.svg"
        );

        articleImages.put(
                "Cycling for Short Trips",
                "/article-images/cycling.svg"
        );

        articleImages.put(
                "Understanding Your Carbon Dashboard",
                "/article-images/analytics-dashboard.svg"
        );

        articleImages.put(
                "Set a Realistic Monthly Carbon Goal",
                "/article-images/carbon-goal.svg"
        );

        articleImages.put(
                "Small Changes, Large Impact",
                "/article-images/small-changes.svg"
        );

        articleImages.put(
                "Track Before You Reduce",
                "/article-images/track-before-reduce.svg"
        );

        articleImages.put(
                "Save Water Every Day",
                "/article-images/water-saving.svg"
        );

        articleImages.put(
                "Recycle More, Waste Less",
                "/article-images/recycling.svg"
        );

        articleImages.put(
                "Smarter Agriculture, Lower Emissions",
                "/article-images/agriculture.svg"
        );

        articleImages.put(
                "Comfort Without Carbon Waste",
                "/article-images/buildings-heating.svg"
        );

        for (
                Map.Entry<String, String> e :
                articleImages.entrySet()
        ) {

            Article article =
                    articleRepository
                            .findAll()
                            .stream()
                            .filter(
                                    a ->
                                            e.getKey()
                                                    .equalsIgnoreCase(
                                                            a.getTitle()
                                                    )
                            )
                            .findFirst()
                            .orElse(null);

            if (
                    article != null
            ) {

                article.setCoverImage(
                        e.getValue()
                );

                articleRepository.save(
                        article
                );
            }
        }

        seedExtendedArticles(
                articleImages
        );

        assignUniqueArticleImages(
                articleImages
        );

        seedExtendedActivityLogs(
                activities,
                factorValues,
                categories
        );

        logger.info(
                "Extended dashboard dataset verification complete."
        );
    }

    // =============================================================
    // EMISSION LIMIT UPSERT
    // =============================================================

    private void upsertEmissionLimit(
            Category category,
            double monthlyLimit
    ) {

        EmissionLimit limit =
                emissionLimitRepository
                        .findByCategoryCategoryId(
                                category.getCategoryId()
                        )
                        .orElseGet(
                                () ->
                                        EmissionLimit.builder()
                                                .category(
                                                        category
                                                )
                                                .build()
                        );

        limit.setCategory(
                category
        );

        limit.setMonthlyLimit(
                monthlyLimit
        );

        limit.setUnit(
                "kg CO2e"
        );

        limit.setActive(
                true
        );

        limit.setStatus(
                "ACTIVE"
        );

        emissionLimitRepository.save(
                limit
        );
    }

    // =============================================================
    // UNIQUE ARTICLE IMAGES
    // =============================================================

    private void assignUniqueArticleImages(
            Map<String, String> imageByTitle
    ) {

        List<Article> articles =
                new ArrayList<>(
                        articleRepository.findAll()
                );

        articles.sort(
                Comparator.comparing(
                        Article::getId,
                        Comparator.nullsLast(
                                Comparator.naturalOrder()
                        )
                )
        );

        List<String> fallbackImages =
                new ArrayList<>(
                        imageByTitle.values()
                );

        for (
                int i = 0;
                i < articles.size();
                i++
        ) {

            Article article =
                    articles.get(i);

            String desired =
                    imageByTitle.entrySet()
                            .stream()
                            .filter(
                                    e ->
                                            e.getKey()
                                                    .equalsIgnoreCase(
                                                            article.getTitle()
                                                    )
                            )
                            .map(
                                    Map.Entry::getValue
                            )
                            .findFirst()
                            .orElse(
                                    fallbackImages.isEmpty()
                                            ? null
                                            : fallbackImages.get(
                                            i
                                                    % fallbackImages.size()
                                    )
                            );

            if (
                    desired != null
            ) {

                article.setCoverImage(
                        desired
                );

                articleRepository.save(
                        article
                );
            }
        }
    }

    // =============================================================
    // EXTENDED ARTICLES
    // =============================================================

    private void seedExtendedArticles(
            Map<String, String> articleImages
    ) {

        List<ArticleSeed> seeds =
                List.of(

                        new ArticleSeed(
                                "Save Water Every Day",
                                "Simple habits for reducing household water use.",
                                "Water",
                                "/article-images/water-saving.svg"
                        ),

                        new ArticleSeed(
                                "Recycle More, Waste Less",
                                "Practical household recycling habits with measurable impact.",
                                "Waste",
                                "/article-images/recycling.svg"
                        ),

                        new ArticleSeed(
                                "Smarter Agriculture, Lower Emissions",
                                "How farming inputs and machinery affect the footprint of food production.",
                                "Agriculture",
                                "/article-images/agriculture.svg"
                        ),

                        new ArticleSeed(
                                "Comfort Without Carbon Waste",
                                "Reduce cooling, heating and lighting emissions without sacrificing comfort.",
                                "Buildings",
                                "/article-images/buildings-heating.svg"
                        )
                );

        for (
                ArticleSeed seed :
                seeds
        ) {

            boolean exists =
                    articleRepository
                            .findAll()
                            .stream()
                            .anyMatch(
                                    a ->
                                            seed.title
                                                    .equalsIgnoreCase(
                                                            a.getTitle()
                                                    )
                            );

            if (!exists) {

                articleRepository.save(
                        Article.builder()
                                .title(seed.title)
                                .shortDescription(
                                        seed.description
                                )
                                .content(
                                        seed.description
                                                + " Explore EcoTrack activity data and recommendations to build a practical lower-carbon routine."
                                )
                                .category(
                                        seed.category
                                )
                                .coverImage(
                                        seed.image
                                )
                                .author(
                                        "EcoTrack Admin"
                                )
                                .status(
                                        ArticleStatus.PUBLISHED
                                )
                                .visibleToUsers(
                                        true
                                )
                                .publishedAt(
                                        LocalDateTime.now()
                                                .minusDays(1)
                                )
                                .build()
                );
            }
        }
    }

    // =============================================================
    // EXTENDED ACTIVITY LOGS
    // =============================================================

    private void seedExtendedActivityLogs(
            Map<String, ActivityType> activities,
            Map<String, Double> factors,
            Map<String, Category> categories
    ) {

        List<User> users =
                demoUsersForExtendedLogs();

        if (users.isEmpty()) {
            return;
        }

        String[] codes = {

                "WATER_SHOWER",
                "WATER_LAUNDRY",
                "WATER_IRRIGATION",

                "WASTE_GENERAL",
                "WASTE_PLASTIC",
                "WASTE_PAPER",

                "AGRI_FERTILIZER",
                "AGRI_TRACTOR",
                "AGRI_LIVESTOCK",

                "BUILD_GAS",
                "BUILD_AC",
                "BUILD_LIGHTING"
        };

        for (
                int i = 0;
                i < 70;
                i++
        ) {

            String code =
                    codes[
                            i % codes.length
                    ];

            ActivityType type =
                    activities.get(
                            code
                    );

            if (type == null) {
                continue;
            }

            double quantity =
                    switch (
                            type.getUnit()
                                    .toLowerCase()
                    ) {

                        case "kwh" ->
                                6
                                        + (
                                        i % 8
                                ) * 3;

                        case "liters" ->
                                20
                                        + (
                                        i % 10
                                ) * 10;

                        case "kg" ->
                                1
                                        + (
                                        i % 6
                                ) * 0.5;

                        default ->
                                1
                                        + (
                                        i % 3
                                );
                    };

            User user =
                    users.get(
                            i % users.size()
                    );

            LocalDate date =
                    LocalDate.now()
                            .minusDays(
                                    i % 28
                            );

            addDemoLog(
                    user,
                    type,
                    quantity,
                    date,
                    "Extended dashboard demo activity "
                            + (
                            i + 1
                    )
            );
        }
    }

    // =============================================================
    // EXTENDED DEMO USERS
    // =============================================================

    private List<User> demoUsersForExtendedLogs() {

        return userRepository
                .findAll()
                .stream()
                .filter(
                        u ->
                                u.getEmail() != null
                                        &&
                                u.getEmail()
                                        .endsWith(
                                                "@ecotrack.local"
                                        )
                )
                .toList();
    }

    // =============================================================
    // RECORD TYPES
    // =============================================================

    private record CategorySeed(
            String name,
            String description,
            String icon,
            String color,
            int order,
            String image
    ) {
    }

    private record ActivitySeed(
            String categoryCode,
            String name,
            String description,
            String unit,
            double min,
            double max,
            double def,
            String icon,
            int order
    ) {
    }

    private record ArticleSeed(
            String title,
            String description,
            String category,
            String image
    ) {
    }

    // =============================================================
    // ACTIVITY LOG INSERT
    // =============================================================

    private void addDemoLog(
            User user,
            ActivityType type,
            double quantity,
            LocalDate date,
            String notes
    ) {

        if (type == null || user == null) {
            return;
        }

        if (notes != null && activityLogRepository.existsByUserIdAndNotes(user.getId(), notes)) {
            return;
        }

        EmissionFactor ef =
                emissionFactorRepository
                        .findActiveFactorForDate(
                                type.getActivityTypeId(),
                                date
                        )
                        .orElse(null);

        if (ef == null) {
            return;
        }

        double total =
                Math.round(
                        quantity
                                * ef.getEmissionFactor()
                                * 10000.0
                ) / 10000.0;

        activityLogRepository.save(
                ActivityLog.builder()
                        .user(user)
                        .category(
                                type.getCategory()
                        )
                        .activityType(
                                type
                        )
                        .quantity(
                                quantity
                        )
                        .unit(
                                type.getUnit()
                        )
                        .emissionFactor(
                                ef.getEmissionFactor()
                        )
                        .totalEmission(
                                total
                        )
                        .emissionKg(
                                total
                        )
                        .activityDate(
                                date
                        )
                        .notes(
                                notes
                        )
                        .build()
        );
    }
}