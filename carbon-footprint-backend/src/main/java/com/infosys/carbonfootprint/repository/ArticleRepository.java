package com.infosys.carbonfootprint.repository;
import com.infosys.carbonfootprint.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.*;
public interface ArticleRepository extends JpaRepository<Article,Long> {
 List<Article> findByStatusAndVisibleToUsersTrueOrderByPublishedAtDesc(ArticleStatus status);
 Page<Article> findByStatusAndVisibleToUsersTrue(ArticleStatus status, Pageable pageable);
 Page<Article> findAllByOrderByUpdatedAtDesc(Pageable pageable);
}