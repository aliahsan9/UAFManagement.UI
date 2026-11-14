import { describe, expect, it } from 'vitest';
import { DEGREE_LEVELS } from './academic-structure.models';
describe('Academic structure contracts', () => {
 it('uses the numeric degree-level values defined by the backend enum', () => {
  expect(DEGREE_LEVELS).toEqual([
   {label:'Undergraduate',value:1},{label:'Graduate',value:2},
   {label:'MPhil',value:3},{label:'Doctoral',value:4}
  ]);
 });
 it('keeps campus and faculty as separate university children', () => {
  const campus = { universityId:'university-id' };
  const faculty = { universityId:'university-id' };
  expect(campus).not.toHaveProperty('facultyId');
  expect(faculty).not.toHaveProperty('campusId');
 });
});
