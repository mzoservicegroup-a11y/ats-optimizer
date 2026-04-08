import skillsData from '../../Data/skills.json';

export type SkillCategory = 'technical' | 'business' | 'soft';

export interface SkillsDataset {
  [key: string]: {
    [subCategory: string]: string[];
  };
}

const typedSkillsData = skillsData as any;

/**
 * Loads all skills from the internal dataset.
 */
export function loadSkills() {
  return typedSkillsData;
}

/**
 * Retrieves skills by industry/category.
 */
export function getSkillsByIndustry(category: SkillCategory) {
  return typedSkillsData[category] || {};
}

/**
 * Matches skills from a resume against the job description and internal dataset.
 */
export function matchSkills(resumeText: string, jobDescriptionText: string) {
  const allInternalSkills = Object.values(typedSkillsData).flatMap(cat => 
    Object.values(cat as object).flat()
  ) as string[];

  const resumeSkills = allInternalSkills.filter(skill => 
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(resumeText)
  );

  const jdSkills = allInternalSkills.filter(skill => 
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(jobDescriptionText)
  );

  const matched = resumeSkills.filter(skill => jdSkills.includes(skill));
  const missing = jdSkills.filter(skill => !resumeSkills.includes(skill));

  return {
    matched,
    missing,
    matchPercentage: jdSkills.length > 0 ? (matched.length / jdSkills.length) * 100 : 0
  };
}

/**
 * Suggests skills from the internal database that match the job role but are missing in the resume.
 */
export function suggestSkills(resumeText: string, jobDescriptionText: string) {
  const { missing } = matchSkills(resumeText, jobDescriptionText);
  
  // Also suggest top relevant skills from the same sub-categories as JD skills
  const allInternalSkills = typedSkillsData;
  const suggestions: string[] = [...missing];

  // Logic to find additional relevant skills from same sub-categories
  return Array.from(new Set(suggestions)).slice(0, 10);
}
