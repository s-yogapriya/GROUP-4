package com.infosys.carbonfootprint.service;
import com.infosys.carbonfootprint.dto.RecommendationDto; import java.util.*;
public interface RecommendationService { List<RecommendationDto> topEmissions(Long userId); }