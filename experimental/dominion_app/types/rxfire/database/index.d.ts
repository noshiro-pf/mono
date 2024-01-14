declare module 'rxfire/database'
/**
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { database } from 'firebase'
import {
  ListenEvent,
  QueryChange,
} from 'rxfire/database/dist/database/interfaces'
import { Observable } from 'rxjs'
export declare function stateChanges(
  query: database.Query,
  events?: ListenEvent[],
): Observable<QueryChange>
export declare function list(
  query: database.Query,
  events?: ListenEvent[],
): Observable<QueryChange[]>
/**
 * Get an object mapped to its value, and optionally its key
 * @param query object ref or query
 * @param keyField map the object key to a specific field
 */
export declare function listVal<T>(
  query: database.Query,
  keyField?: string,
): Observable<T[]>
