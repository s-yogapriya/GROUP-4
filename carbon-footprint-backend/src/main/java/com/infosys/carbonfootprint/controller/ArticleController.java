package com.infosys.carbonfootprint.controller;
import com.infosys.carbonfootprint.dto.*; import com.infosys.carbonfootprint.response.ApiResponse; import com.infosys.carbonfootprint.security.UserDetailsImpl; import com.infosys.carbonfootprint.service.ArticleService; import org.springframework.http.MediaType; import org.springframework.web.bind.annotation.*; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.multipart.MultipartFile; import jakarta.validation.Valid; import java.util.*; import org.springframework.data.domain.Page; import org.springframework.data.domain.PageRequest; import org.springframework.data.domain.Pageable; import org.springframework.data.domain.Sort;

@RestController @RequestMapping("/api/v1/articles") public class ArticleController {
    private final ArticleService service;
    public ArticleController(ArticleService service) { this.service = service; }

    @GetMapping @PreAuthorize("hasAnyRole('USER','ADMIN')") public ApiResponse<List<ArticleDto>> all() { return ApiResponse.success("Published articles", service.userArticles()); }
    @GetMapping("/page") @PreAuthorize("hasAnyRole('USER','ADMIN')") public ApiResponse<Page<ArticleDto>> userPage(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="5") int size) { int safeSize=List.of(5,10,15,20,50).contains(size)?size:5; Pageable pageable=PageRequest.of(Math.max(0,page),safeSize,Sort.by("publishedAt").descending()); return ApiResponse.success("Published articles page", service.userArticlesPage(pageable)); }
    @GetMapping("/admin/page") @PreAuthorize("hasRole('ADMIN')") public ApiResponse<Page<ArticleDto>> adminPage(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="5") int size) { int safeSize=List.of(5,10,15,20,50).contains(size)?size:5; Pageable pageable=PageRequest.of(Math.max(0,page),safeSize,Sort.by("updatedAt").descending()); return ApiResponse.success("Articles page", service.adminArticlesPage(pageable)); }
    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('USER','ADMIN')") public ApiResponse<ArticleDto> one(@PathVariable Long id) { return ApiResponse.success("Article fetched", service.userArticle(id)); }
    @GetMapping("/admin/all") @PreAuthorize("hasRole('ADMIN')") public ApiResponse<List<ArticleDto>> admin() { return ApiResponse.success("Articles fetched", service.adminArticles()); }

    @PostMapping(value = "/admin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ArticleDto> create(
            @RequestParam("title") String title,
            @RequestParam("shortDescription") String shortDescription,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam(value = "status", required = false, defaultValue = "DRAFT") String status,
            @RequestParam(value = "visibleToUsers", required = false, defaultValue = "false") boolean visibleToUsers,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetailsImpl u) {
        ArticleRequest r = buildRequest(title, shortDescription, content, category, status, visibleToUsers, null);
        return ApiResponse.success("Article saved", service.saveWithImage(r, image, u.getUsername(), null));
    }

    @PutMapping(value = "/admin/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ArticleDto> edit(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("shortDescription") String shortDescription,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam(value = "status", required = false, defaultValue = "DRAFT") String status,
            @RequestParam(value = "visibleToUsers", required = false, defaultValue = "false") boolean visibleToUsers,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetailsImpl u) {
        ArticleRequest r = buildRequest(title, shortDescription, content, category, status, visibleToUsers, null);
        return ApiResponse.success("Article updated", service.saveWithImage(r, image, u.getUsername(), id));
    }

    @DeleteMapping("/admin/{id}") @PreAuthorize("hasRole('ADMIN')") public ApiResponse<Void> delete(@PathVariable Long id) { service.delete(id); return ApiResponse.success("Article deleted"); }
    @PutMapping("/admin/{id}/publish") @PreAuthorize("hasRole('ADMIN')") public ApiResponse<ArticleDto> publish(@PathVariable Long id) { return ApiResponse.success("Article published", service.publish(id)); }
    @PutMapping("/admin/{id}/unpublish") @PreAuthorize("hasRole('ADMIN')") public ApiResponse<ArticleDto> unpublish(@PathVariable Long id) { return ApiResponse.success("Article unpublished", service.unpublish(id)); }

    private ArticleRequest buildRequest(String title, String shortDesc, String content, String category, String status, boolean visible, String coverImage) {
        ArticleRequest r = new ArticleRequest();
        r.setTitle(title); r.setShortDescription(shortDesc); r.setContent(content); r.setCategory(category);
        r.setCoverImage(coverImage);
        try { r.setStatus(com.infosys.carbonfootprint.entity.ArticleStatus.valueOf(status.trim().toUpperCase()));} catch (IllegalArgumentException e) {throw new IllegalArgumentException("Invalid article status: " + status +
        ". Allowed values are DRAFT, PUBLISHED, UNPUBLISHED.");}
        r.setVisibleToUsers(visible);
        return r;
    }
}