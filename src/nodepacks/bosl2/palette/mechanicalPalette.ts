import type { PaletteItem } from '@/types/nodes'

export const MECHANICAL_PALETTE: PaletteItem[] = [
  {
    type: 'bosl2_spur_gear', label: 'spur_gear', category: 'bosl2_mechanical',
    defaultData: { mod: 2, teeth: 20, thickness: 5, pressure_angle: 20, helical: 0, shaft_diam: 5, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 spur gear.',
    inputs: 'mod — module; teeth; thickness; pressure_angle; helical; shaft_diam',
  },
  {
    type: 'bosl2_rack', label: 'rack', category: 'bosl2_mechanical',
    defaultData: { mod: 2, teeth: 10, thickness: 5, pressure_angle: 20, helical: 0, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 gear rack (linear gear).',
    inputs: 'mod — module; teeth; thickness; pressure_angle; helical',
  },
  {
    type: 'bosl2_bevel_gear', label: 'bevel_gear', category: 'bosl2_mechanical',
    defaultData: { mod: 2, teeth: 20, mate_teeth: 20, shaft_angle: 90, face_width: 10, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 bevel gear for intersecting shaft axes.',
    inputs: 'mod; teeth; mate_teeth; shaft_angle; face_width',
  },
  {
    type: 'bosl2_worm', label: 'worm', category: 'bosl2_mechanical',
    defaultData: { mod: 2, d: 20, l: 30, starts: 1, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 worm gear screw.',
    inputs: 'mod — module; d — diameter; l — length; starts',
  },
  {
    type: 'bosl2_worm_gear', label: 'worm_gear', category: 'bosl2_mechanical',
    defaultData: { mod: 2, teeth: 30, worm_diam: 20, worm_starts: 1, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 worm gear wheel.',
    inputs: 'mod; teeth; worm_diam; worm_starts',
  },
  {
    type: 'bosl2_threaded_rod', label: 'threaded_rod', category: 'bosl2_mechanical',
    defaultData: { d: 10, l: 30, pitch: 2, internal: false, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 threaded rod (UTS/ISO threading).',
    inputs: 'd — diameter; l — length; pitch; internal',
  },
  {
    type: 'bosl2_threaded_nut', label: 'threaded_nut', category: 'bosl2_mechanical',
    defaultData: { nutwidth: 17, id: 10, h: 8, pitch: 2, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 threaded nut.',
    inputs: 'nutwidth — outer width; id — inner diameter; h — height; pitch',
  },
  {
    type: 'bosl2_screw', label: 'screw', category: 'bosl2_mechanical',
    defaultData: { spec: 'M3', head: 'socket', drive: 'hex', length: 12, thread_len: 0, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 screw — parametric screw by spec string.',
    inputs: 'spec — e.g. "M3"; head; drive; length; thread_len',
  },
  {
    type: 'bosl2_screw_hole', label: 'screw_hole', category: 'bosl2_mechanical',
    defaultData: { spec: 'M3', head: 'socket', length: 12, oversize: 0, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 screw_hole — clearance hole for a screw.',
    inputs: 'spec; head; length; oversize',
  },
  {
    type: 'bosl2_nut', label: 'nut', category: 'bosl2_mechanical',
    defaultData: { spec: 'M3', shape: 'hex', thickness: 2.4, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 nut — parametric nut by spec string.',
    inputs: 'spec; shape — hex or square; thickness',
  },
  {
    type: 'bosl2_dovetail', label: 'dovetail', category: 'bosl2_mechanical',
    defaultData: { gender: 'male', width: 10, height: 5, slope: 6, slide: 20, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 dovetail joint.',
    inputs: 'gender — male/female; width; height; slope; slide',
  },
  {
    type: 'bosl2_snap_pin', label: 'snap_pin', category: 'bosl2_mechanical',
    defaultData: { r: 1.5, l: 10, nub_depth: 0.4, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 snap pin for snap-fit joints.',
    inputs: 'r — pin radius; l — length; nub_depth',
  },
  {
    type: 'bosl2_knuckle_hinge', label: 'knuckle_hinge', category: 'bosl2_mechanical',
    defaultData: { length: 30, offset: 5, segs: 4, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 knuckle hinge.',
    inputs: 'length; offset; segs — knuckle segments',
  },
  {
    type: 'bosl2_bottle_neck', label: 'bottle_neck', category: 'bosl2_mechanical',
    defaultData: { wall: 2, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 generic bottle neck threading.',
    inputs: 'wall — wall thickness',
  },
  {
    type: 'bosl2_bottle_cap', label: 'bottle_cap', category: 'bosl2_mechanical',
    defaultData: { wall: 2, texture: 'pointed', anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 generic bottle cap.',
    inputs: 'wall — thickness; texture — grip pattern',
  },
]
