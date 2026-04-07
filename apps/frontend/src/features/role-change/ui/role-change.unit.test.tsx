import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import BtnRole from './BtnRole';
import { RolesEmployee } from './RolesEmployee';
import { createRoleChangeUser } from './test-mocks';

describe('role-change ui', () => {
  describe('BtnRole', () => {
    it('adds active class and disables button for active admin role', () => {
      const user = createRoleChangeUser('HR');
      const html = renderToStaticMarkup(
        React.createElement(BtnRole, {
          roleName: 'HR',
          user,
          onRoleChange: () => {},
          isAdmin: true,
        }),
      );

      expect(html).toContain('section-roles__role-hr role');
      expect(html).toContain('disabled');
    });

    it('does not disable active button for non-admin viewer', () => {
      const user = createRoleChangeUser('HR');
      const html = renderToStaticMarkup(
        React.createElement(BtnRole, {
          roleName: 'HR',
          user,
          onRoleChange: () => {},
          isAdmin: false,
        }),
      );

      expect(html).toContain('section-roles__role-hr role');
      expect(html).not.toContain('disabled');
    });

    it('calls onRoleChange with target user id and role', () => {
      const user = createRoleChangeUser('Employee');
      const onRoleChange = vi.fn();
      const container = document.createElement('div');
      const root = createRoot(container);

      act(() => {
        root.render(
          React.createElement(BtnRole, {
            roleName: 'HR',
            user,
            onRoleChange,
            isAdmin: true,
          }),
        );
      });

      const button = container.querySelector('button');
      if (!button) throw new Error('Button not rendered');

      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onRoleChange).toHaveBeenCalledTimes(1);
      expect(onRoleChange).toHaveBeenCalledWith('emp-1', 'HR');

      act(() => {
        root.unmount();
      });
    });
  });

  describe('RolesEmployee', () => {
    it('renders employee full name, role buttons and non-active admin label', () => {
      const user = createRoleChangeUser('Employee');
      const html = renderToStaticMarkup(
        React.createElement(RolesEmployee, {
          user,
          onRoleChange: () => {},
          isAdmin: true,
          key: 'emp-1',
        }),
      );

      expect(html).toContain('John Doe');
      expect(html).toContain('Employee');
      expect(html).toContain('HR');
      expect(html).toContain('section-roles__role-admin ');
      expect(html).toContain('admin');
    });

    it('renders active class for admin label when user role is Admin', () => {
      const user = createRoleChangeUser('Admin');
      const html = renderToStaticMarkup(
        React.createElement(RolesEmployee, {
          user,
          onRoleChange: () => {},
          isAdmin: true,
          key: 'emp-1',
        }),
      );

      expect(html).toContain('section-roles__role-admin role');
    });
  });
});
