import React, { useState } from 'react';
import { Container, Header, Content, Grid, Row, Col, Card, Button, CustomProvider } from 'rsuite';
import * as Icons from 'sf-symbols-lib';
import { AvailableSFSymbol, SFIconProps } from 'sf-symbols-lib';
import 'rsuite/dist/rsuite.min.css';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Get all icon components
  const iconEntries = Object.entries(Icons).filter(([key]) => key.startsWith('SF') && key !== 'SFIcon');

  return (
    <CustomProvider theme={theme}>
      <Container className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header className="p-4 bg-white dark:bg-gray-800 shadow">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SF Symbols Library Demo</h1>
            <Button onClick={toggleTheme} appearance="primary">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
          </div>
        </Header>
        <Content className="p-4">
          <Grid fluid>
            <Row gutter={16}>
              {iconEntries.map(([key, IconComponent]) => {
                const Icon = IconComponent as React.ComponentType<SFIconProps>;
                const originalName = AvailableSFSymbol[key as keyof typeof AvailableSFSymbol] || key;
                return (
                  <Col key={key} xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Card className="mb-4 h-full">
                      <Card.Body className="text-center">
                        <div className="mb-2">
                          <Icon size={48} />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{originalName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">{key}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Grid>
        </Content>
      </Container>
    </CustomProvider>
  );
};

export default App;