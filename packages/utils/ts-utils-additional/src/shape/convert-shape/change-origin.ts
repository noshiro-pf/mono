import { type Point, type Rect } from '../../types';

/* 点・矩形の位置を表す座標の原点を変更する */

export const changeOriginOfPos =
  (originFrom: Point, originTo: Point) =>
  (target: Point): Point => ({
    x: target.x - (originTo.x - originFrom.x),
    y: target.y - (originTo.y - originFrom.y),
  });

export const changeOriginOfRect =
  (originFrom: Point, originTo: Point) =>
  (target: Rect): Rect => ({
    left: target.left - (originTo.x - originFrom.x),
    top: target.top - (originTo.y - originFrom.y),
    width: target.width,
    height: target.height,
  });
