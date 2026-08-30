package com.infosys.carbonfootprint.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

import java.sql.Connection;
import java.sql.Statement;

/**
 * Brings legacy PostgreSQL columns required by the current entities
 * into a consistent state without deleting existing business data.
 */
@Component
@Order(2)
public class SchemaCompatibilityInitializer
        implements CommandLineRunner {

    private final DataSource dataSource;


    public SchemaCompatibilityInitializer(
            DataSource dataSource
    ) {
        this.dataSource = dataSource;
    }


    @Override
    public void run(
            String... args
    ) throws Exception {

        try (
                Connection connection =
                        dataSource.getConnection();

                Statement statement =
                        connection.createStatement()
        ) {

            /* =====================================================
               GOALS
            ===================================================== */

            /*
             * Legacy goals table may contain both:
             * goal_year and target_year.
             */
            statement.executeUpdate(
                    "UPDATE goals " +
                    "SET target_year = goal_year " +
                    "WHERE target_year IS NULL"
            );


            /*
             * Keep target_emission synchronized
             * with target_amount.
             */
            statement.executeUpdate(
                    "UPDATE goals " +
                    "SET target_emission = target_amount " +
                    "WHERE target_emission IS NULL"
            );


            /*
             * Legacy rows without status.
             */
            statement.executeUpdate(
                    "UPDATE goals " +
                    "SET status = 'IN PROGRESS' " +
                    "WHERE status IS NULL"
            );


            /*
             * Safe defaults for future inserts.
             */
            statement.executeUpdate(
                    "ALTER TABLE goals " +
                    "ALTER COLUMN status " +
                    "SET DEFAULT 'IN PROGRESS'"
            );


            statement.executeUpdate(
                    "ALTER TABLE goals " +
                    "ALTER COLUMN target_emission " +
                    "SET DEFAULT 0"
            );


            /* =====================================================
               ARTICLES
            ===================================================== */

            /*
             * Old articles may have no author.
             */
            statement.executeUpdate(
                    "UPDATE articles " +
                    "SET author = 'EcoTrack Admin' " +
                    "WHERE author IS NULL"
            );


            /*
             * Old articles may have no visibility value.
             */
            statement.executeUpdate(
                    "UPDATE articles " +
                    "SET visible_to_users = FALSE " +
                    "WHERE visible_to_users IS NULL"
            );


            /*
             * Defaults for future article records.
             */
            statement.executeUpdate(
                    "ALTER TABLE articles " +
                    "ALTER COLUMN author " +
                    "SET DEFAULT 'EcoTrack Admin'"
            );


            statement.executeUpdate(
                    "ALTER TABLE articles " +
                    "ALTER COLUMN visible_to_users " +
                    "SET DEFAULT FALSE"
            );


            /* =====================================================
               ALERTS
            ===================================================== */

            /*
             * IMPORTANT:
             *
             * Existing alerts created before threshold_value
             * was introduced may contain NULL.
             *
             * Use monthly_limit first.
             * If monthly_limit is unavailable, use current_emission.
             * If both are unavailable, use 0.
             */
            statement.executeUpdate(
                    "UPDATE alerts " +
                    "SET threshold_value = " +
                    "COALESCE(monthly_limit, current_emission, 0) " +
                    "WHERE threshold_value IS NULL"
            );


            /*
             * Protect future inserts from NULL values.
             */
            statement.executeUpdate(
                    "ALTER TABLE alerts " +
                    "ALTER COLUMN threshold_value " +
                    "SET DEFAULT 0"
            );


            /*
             * Existing rows must not remain NULL.
             *
             * This is deliberately executed after the backfill.
             */
            statement.executeUpdate(
                    "UPDATE alerts " +
                    "SET threshold_value = 0 " +
                    "WHERE threshold_value IS NULL"
            );
        }
    }
}