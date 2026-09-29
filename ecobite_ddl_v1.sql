--
-- PostgreSQL database dump
--

\restrict JU33Spvfh2XHSOEr6bwhFN5C5KfIBCC8dtpeRHpbo0I0pdlcpKTO0kicMCxDGZW

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EstadoEnvio; Type: TYPE; Schema: public; Owner: ecobite_user
--

CREATE TYPE public."EstadoEnvio" AS ENUM (
    'pendiente',
    'en_transito',
    'entregado'
);


ALTER TYPE public."EstadoEnvio" OWNER TO ecobite_user;

--
-- Name: EstadoPedido; Type: TYPE; Schema: public; Owner: ecobite_user
--

CREATE TYPE public."EstadoPedido" AS ENUM (
    'pendiente',
    'confirmado',
    'preparando',
    'listo',
    'en_transito',
    'entregado',
    'completado'
);


ALTER TYPE public."EstadoPedido" OWNER TO ecobite_user;

--
-- Name: EstadoRestaurante; Type: TYPE; Schema: public; Owner: ecobite_user
--

CREATE TYPE public."EstadoRestaurante" AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public."EstadoRestaurante" OWNER TO ecobite_user;

--
-- Name: NivelAcceso; Type: TYPE; Schema: public; Owner: ecobite_user
--

CREATE TYPE public."NivelAcceso" AS ENUM (
    'propio',
    'restaurante',
    'global',
    'delivery'
);


ALTER TYPE public."NivelAcceso" OWNER TO ecobite_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: delivery; Type: TABLE; Schema: public; Owner: ecobite_user
--

CREATE TABLE public.delivery (
    id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    tipo_transporte_id uuid NOT NULL
);


ALTER TABLE public.delivery OWNER TO ecobite_user;

--
-- Name: delivery_restaurante; Type: TABLE; Schema: public; Owner: ecobite_user
--

CREATE TABLE public.delivery_restaurante (
    id uuid NOT NULL,
    delivery_id uuid NOT NULL,
    restaurante_id uuid NOT NULL
);


ALTER TABLE public.delivery_restaurante OWNER TO ecobite_user;

--
-- Name: envio; Type: TABLE; Schema: public; Owner: ecobite_user
--

CREATE TABLE public.envio (
    id uuid NOT NULL,
    pedido_id uuid NOT NULL,
    fecha_envio timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    delivery_id uuid NOT NULL,
    distancia_km numeric(5,2) DEFAULT 1.50 NOT NULL,
    restaurante_id uuid NOT NULL,
    domicilio_destino character varying(500) NOT NULL,
    estado public."EstadoEnvio" DEFAULT 'pendiente'::public."EstadoEnvio" NOT NULL
);


ALTER TABLE public.envio OWNER TO ecobite_user;

--
-- Name: itempedido; Type: TABLE; Schema: public; Owner: ecobite_user
--

CREATE TABLE public.itempedido (
    id uuid NOT NULL,
    pedido_id uuid NOT NULL,
    plato_id uuid NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    CONSTRAINT itempedido_cantidad_check CHECK ((cantidad > 0))
);


ALTER TABLE public.itempedido OWNER TO ecobite_user;

--
-- Name: pedido; Type: TABLE; Schema: public; Owner: ecobite_user
--

CREATE TABLE public.pedido (
    id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    restaurante_id uuid NOT NULL,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado public."EstadoPedido" DEFAULT 'pendiente'::public."EstadoPedido" NOT NULL,
    monto_total numeric(10,2) DEFAULT 0.00 NOT NULL
);


ALTER TABLE public.pedido OWNER TO ecobite_user;

--
-- Name: plato; Type: TABLE; Schema: public; Owner: ecobite_user
--

CREATE TABLE public.plato (
    id uuid NOT NULL,
    restaurante_id uuid NOT NULL,
    nombre character varying(200) NOT NULL,
    precio numeric(10,2) NOT NULL,
    cantidad_vasos integer DEFAULT 0,
    cantidad_platos integer DEFAULT 0,
    cantidad_cubiertos integer DEFAULT 0,
    cantidad_recipiente integer DEFAULT 0
);


ALTER TABLE public.plato OWNER TO ecobite_user;

--
-- Name: restaurante; Type: TABLE; Schema: public; Owner: ecobite_user
--

CREATE TABLE public.restaurante (
    id uuid NOT NULL,
    nombre character varying(200) NOT NULL,
    email character varying(200) NOT NULL,
    domicilio character varying(200) NOT NULL,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    estado public."EstadoRestaurante" DEFAULT 'activo'::public."EstadoRestaurante" NOT NULL
);


ALTER TABLE public.restaurante OWNER TO ecobite_user;

--
-- Name: tipo_usuario; Type: TABLE; Schema: public; Owner: ecobite_user
--

CREATE TABLE public.tipo_usuario (
    id uuid NOT NULL,
    nombre_rol character varying(100) NOT NULL,
    nivel_acceso public."NivelAcceso" NOT NULL
);


ALTER TABLE public.tipo_usuario OWNER TO ecobite_user;

--
-- Name: tipotransporte; Type: TABLE; Schema: public; Owner: ecobite_user
--

CREATE TABLE public.tipotransporte (
    id uuid NOT NULL,
    descripcion character varying(20) NOT NULL
);


ALTER TABLE public.tipotransporte OWNER TO ecobite_user;

--
-- Name: usuario; Type: TABLE; Schema: public; Owner: ecobite_user
--

CREATE TABLE public.usuario (
    id uuid NOT NULL,
    email character varying(200) NOT NULL,
    nombre character varying(200) NOT NULL,
    "contraseña" character varying(255) NOT NULL,
    tipo_usuario_id uuid NOT NULL
);


ALTER TABLE public.usuario OWNER TO ecobite_user;

--
-- Name: delivery delivery_pkey; Type: CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.delivery
    ADD CONSTRAINT delivery_pkey PRIMARY KEY (id);


--
-- Name: delivery_restaurante delivery_restaurante_pkey; Type: CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.delivery_restaurante
    ADD CONSTRAINT delivery_restaurante_pkey PRIMARY KEY (id);


--
-- Name: envio envio_pkey; Type: CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.envio
    ADD CONSTRAINT envio_pkey PRIMARY KEY (id);


--
-- Name: itempedido itempedido_pkey; Type: CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.itempedido
    ADD CONSTRAINT itempedido_pkey PRIMARY KEY (id);


--
-- Name: pedido pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_pkey PRIMARY KEY (id);


--
-- Name: plato plato_pkey; Type: CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.plato
    ADD CONSTRAINT plato_pkey PRIMARY KEY (id);


--
-- Name: restaurante restaurante_pkey; Type: CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.restaurante
    ADD CONSTRAINT restaurante_pkey PRIMARY KEY (id);


--
-- Name: tipo_usuario tipo_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.tipo_usuario
    ADD CONSTRAINT tipo_usuario_pkey PRIMARY KEY (id);


--
-- Name: tipotransporte tipotransporte_pkey; Type: CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.tipotransporte
    ADD CONSTRAINT tipotransporte_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: delivery_restaurante_delivery_id_restaurante_id_key; Type: INDEX; Schema: public; Owner: ecobite_user
--

CREATE UNIQUE INDEX delivery_restaurante_delivery_id_restaurante_id_key ON public.delivery_restaurante USING btree (delivery_id, restaurante_id);


--
-- Name: delivery_usuario_id_key; Type: INDEX; Schema: public; Owner: ecobite_user
--

CREATE UNIQUE INDEX delivery_usuario_id_key ON public.delivery USING btree (usuario_id);


--
-- Name: envio_pedido_id_key; Type: INDEX; Schema: public; Owner: ecobite_user
--

CREATE UNIQUE INDEX envio_pedido_id_key ON public.envio USING btree (pedido_id);


--
-- Name: idx_envio_fecha_delivery; Type: INDEX; Schema: public; Owner: ecobite_user
--

CREATE INDEX idx_envio_fecha_delivery ON public.envio USING btree (fecha_envio, delivery_id);


--
-- Name: idx_pedido_fecha_estado; Type: INDEX; Schema: public; Owner: ecobite_user
--

CREATE INDEX idx_pedido_fecha_estado ON public.pedido USING btree (fecha, estado);


--
-- Name: restaurante_email_key; Type: INDEX; Schema: public; Owner: ecobite_user
--

CREATE UNIQUE INDEX restaurante_email_key ON public.restaurante USING btree (email);


--
-- Name: tipo_usuario_nombre_rol_key; Type: INDEX; Schema: public; Owner: ecobite_user
--

CREATE UNIQUE INDEX tipo_usuario_nombre_rol_key ON public.tipo_usuario USING btree (nombre_rol);


--
-- Name: tipotransporte_descripcion_key; Type: INDEX; Schema: public; Owner: ecobite_user
--

CREATE UNIQUE INDEX tipotransporte_descripcion_key ON public.tipotransporte USING btree (descripcion);


--
-- Name: usuario_email_key; Type: INDEX; Schema: public; Owner: ecobite_user
--

CREATE UNIQUE INDEX usuario_email_key ON public.usuario USING btree (email);


--
-- Name: delivery_restaurante delivery_restaurante_delivery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.delivery_restaurante
    ADD CONSTRAINT delivery_restaurante_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.delivery(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: delivery_restaurante delivery_restaurante_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.delivery_restaurante
    ADD CONSTRAINT delivery_restaurante_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurante(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: delivery delivery_tipo_transporte_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.delivery
    ADD CONSTRAINT delivery_tipo_transporte_id_fkey FOREIGN KEY (tipo_transporte_id) REFERENCES public.tipotransporte(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: delivery delivery_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.delivery
    ADD CONSTRAINT delivery_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: envio envio_delivery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.envio
    ADD CONSTRAINT envio_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.delivery(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: envio envio_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.envio
    ADD CONSTRAINT envio_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedido(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: envio envio_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.envio
    ADD CONSTRAINT envio_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurante(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: itempedido itempedido_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.itempedido
    ADD CONSTRAINT itempedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedido(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: itempedido itempedido_plato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.itempedido
    ADD CONSTRAINT itempedido_plato_id_fkey FOREIGN KEY (plato_id) REFERENCES public.plato(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pedido pedido_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurante(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pedido pedido_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: plato plato_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.plato
    ADD CONSTRAINT plato_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurante(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuario usuario_tipo_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecobite_user
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_tipo_usuario_id_fkey FOREIGN KEY (tipo_usuario_id) REFERENCES public.tipo_usuario(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict JU33Spvfh2XHSOEr6bwhFN5C5KfIBCC8dtpeRHpbo0I0pdlcpKTO0kicMCxDGZW

