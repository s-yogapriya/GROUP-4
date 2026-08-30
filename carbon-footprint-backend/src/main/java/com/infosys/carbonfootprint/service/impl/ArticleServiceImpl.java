package com.infosys.carbonfootprint.service.impl;
import com.infosys.carbonfootprint.dto.*; import com.infosys.carbonfootprint.entity.*; import com.infosys.carbonfootprint.exception.ResourceNotFoundException; import com.infosys.carbonfootprint.repository.ArticleRepository; import com.infosys.carbonfootprint.service.ArticleService; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import org.springframework.web.multipart.MultipartFile; import java.io.IOException; import java.nio.file.*; import java.time.*; import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository repo;

    @Value("${app.upload.article-images:uploads/articles}")
    private String articleUploadDir;

    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/jpg", "image/png", "image/webp");

    public ArticleServiceImpl(ArticleRepository repo) { this.repo = repo; }

    private ArticleDto dto(Article a) { return ArticleDto.builder().id(a.getId()).title(a.getTitle()).shortDescription(a.getShortDescription()).content(a.getContent()).category(a.getCategory()).coverImage(a.getCoverImage()).author(a.getAuthor()).status(a.getStatus()).visibleToUsers(a.isVisibleToUsers()).publishedAt(a.getPublishedAt()).createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt()).build(); }

    public List<ArticleDto> userArticles() { return repo.findByStatusAndVisibleToUsersTrueOrderByPublishedAtDesc(ArticleStatus.PUBLISHED).stream().map(this::dto).toList(); }

    public Page<ArticleDto> userArticlesPage(Pageable pageable) { return repo.findByStatusAndVisibleToUsersTrue(ArticleStatus.PUBLISHED, pageable).map(this::dto); }

    public Page<ArticleDto> adminArticlesPage(Pageable pageable) { return repo.findAllByOrderByUpdatedAtDesc(pageable).map(this::dto); }

    public ArticleDto userArticle(Long id) { Article a = repo.findById(id).filter(x -> x.getStatus() == ArticleStatus.PUBLISHED && x.isVisibleToUsers()).orElseThrow(() -> new ResourceNotFoundException("Published article not found")); return dto(a); }

    public List<ArticleDto> adminArticles() { return repo.findAll().stream().sorted(Comparator.comparing(Article::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder()))).map(this::dto).toList(); }

    @Transactional
    public ArticleDto save(ArticleRequest r, String author, Long id) {
        Article a = id == null ? new Article() : repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Article", "id", id));
        a.setTitle(r.getTitle()); a.setShortDescription(r.getShortDescription()); a.setContent(r.getContent()); a.setCategory(r.getCategory()); a.setCoverImage(r.getCoverImage());
        if (id == null) a.setAuthor(author);
        if (r.getStatus() != null) a.setStatus(r.getStatus());
        if (r.getVisibleToUsers() != null) a.setVisibleToUsers(r.getVisibleToUsers());
        if (a.getStatus() == ArticleStatus.PUBLISHED && a.getPublishedAt() == null) a.setPublishedAt(LocalDateTime.now());
        return dto(repo.save(a));
    }

    @Transactional
    public ArticleDto saveWithImage(ArticleRequest r, MultipartFile image, String author, Long id) {
        Article a = id == null ? new Article() : repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Article", "id", id));
        a.setTitle(r.getTitle()); a.setShortDescription(r.getShortDescription()); a.setContent(r.getContent()); a.setCategory(r.getCategory());
        if (id == null) a.setAuthor(author);
        if (r.getStatus() != null) a.setStatus(r.getStatus());
        if (r.getVisibleToUsers() != null) a.setVisibleToUsers(r.getVisibleToUsers());
        if (a.getStatus() == ArticleStatus.PUBLISHED && a.getPublishedAt() == null) a.setPublishedAt(LocalDateTime.now());

        if (image != null && !image.isEmpty()) {
            String contentType = image.getContentType();
            if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase()))
                throw new IllegalArgumentException("Only JPG, JPEG, PNG and WEBP images are allowed.");
            if (image.getSize() > MAX_IMAGE_BYTES)
                throw new IllegalArgumentException("Image size must be less than 5 MB.");

            try {
                Path uploadPath = Paths.get(articleUploadDir).toAbsolutePath().normalize();
                Files.createDirectories(uploadPath);
                String original = image.getOriginalFilename();
                String ext = (original != null && original.contains(".")) ? original.substring(original.lastIndexOf(".")).toLowerCase() : ".jpg";
                String filename = "article_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12) + ext;
                Files.copy(image.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
                // Delete old local image if it was a locally uploaded one
                deleteLocalImage(a.getCoverImage(), uploadPath);
                a.setCoverImage("/uploads/articles/" + filename);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store article image.", e);
            }
        } else {
            // No new image — keep existing coverImage (do not overwrite with null)
            // If r.getCoverImage() is explicitly provided (non-null), use it; otherwise keep current
            if (r.getCoverImage() != null) a.setCoverImage(r.getCoverImage());
        }

        return dto(repo.save(a));
    }

    @Transactional
    public void delete(Long id) {
        Article a = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Article", "id", id));
        // Attempt to delete local image file if it is a locally uploaded one
        if (a.getCoverImage() != null && a.getCoverImage().startsWith("/uploads/articles/")) {
            try {
                Path uploadPath = Paths.get(articleUploadDir).toAbsolutePath().normalize();
                deleteLocalImage(a.getCoverImage(), uploadPath);
            } catch (Exception ignored) {}
        }
        repo.delete(a);
    }

    private void deleteLocalImage(String coverImage, Path uploadPath) {
        if (coverImage == null || !coverImage.startsWith("/uploads/articles/")) return;
        try {
            String filename = coverImage.substring(coverImage.lastIndexOf('/') + 1);
            Path file = uploadPath.resolve(filename);
            Files.deleteIfExists(file);
        } catch (IOException ignored) {}
    }

    @Transactional public ArticleDto publish(Long id) { Article a = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Article", "id", id)); a.setStatus(ArticleStatus.PUBLISHED); a.setVisibleToUsers(true); if (a.getPublishedAt() == null) a.setPublishedAt(LocalDateTime.now()); return dto(repo.save(a)); }

    @Transactional public ArticleDto unpublish(Long id) { Article a = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Article", "id", id)); a.setStatus(ArticleStatus.UNPUBLISHED); a.setVisibleToUsers(false); return dto(repo.save(a)); }
}