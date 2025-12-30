import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {OrderType} from '../../../types/order.type';
import {DefaultResponseType} from "../../../types/default-response.type";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  constructor(private http: HttpClient) {
  }

  createOrder(params: OrderType): Observable<any> {
    return this.http.post<OrderType | DefaultResponseType>(environment.api + 'requests', params);
  }
}
